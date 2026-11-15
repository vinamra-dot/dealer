import { query } from '../config/db.js';

export async function listAuctions(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM exchange_auctions WHERE dealership_id = $1 ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function placeAuctionBid(req, res, next) {
  try {
    const { id } = req.params;
    const { bidder_name, bid_amount } = req.body;

    const current = await query(`SELECT * FROM exchange_auctions WHERE id = $1;`, [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Auction record not found.' });
    }

    const cur = current.rows[0];
    const newBid = parseFloat(bid_amount || (parseFloat(cur.current_highest_bid) + 15000));
    const bidder = bidder_name || 'Spinny Wholesale Hub';

    const updated = await query(
      `UPDATE exchange_auctions 
       SET current_highest_bid = $1, highest_bidder = $2, total_bids = total_bids + 1
       WHERE id = $3
       RETURNING *;`,
      [newBid, bidder, id]
    );

    return res.json({ success: true, message: `New bid of ₹${newBid.toLocaleString('en-IN')} placed by ${bidder}.`, data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function acceptAuctionBid(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await query(
      `UPDATE exchange_auctions 
       SET auction_status = 'ACCEPTED'
       WHERE id = $1
       RETURNING *;`,
      [id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Auction not found.' });
    }
    return res.json({ success: true, message: 'Exchange auction finalized and winning bid accepted.', data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}
