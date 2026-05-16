import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json({ users: [] });
  } else if (req.method === 'POST') {
    res.json({ id: 1 });
  }
}