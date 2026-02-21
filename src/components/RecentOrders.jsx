import React from 'react';

const orders = [
  {
    id: '#ORD-2841',
    product: 'Surgical Forceps Set',
    customer: 'City Medical Center',
    date: 'Feb 20, 2026',
    amount: '$1,240',
    status: 'shipped',
  },
  {
    id: '#ORD-2840',
    product: 'MRI Contrast Agent',
    customer: 'RadiologyPlus Inc.',
    date: 'Feb 20, 2026',
    amount: '$3,500',
    status: 'pending',
  },
  {
    id: '#ORD-2839',
    product: 'Lab Centrifuge X200',
    customer: 'BioResearch Labs',
    date: 'Feb 19, 2026',
    amount: '$8,900',
    status: 'delivered',
  },
  {
    id: '#ORD-2838',
    product: 'Ultrasound Probe',
    customer: 'Westside Hospital',
    date: 'Feb 19, 2026',
    amount: '$2,150',
    status: 'processing',
  },
  {
    id: '#ORD-2837',
    product: 'Sterile Gloves Pack',
    customer: 'QuickCare Clinic',
    date: 'Feb 18, 2026',
    amount: '$320',
    status: 'cancelled',
  },
];

export default function RecentOrders() {
  return (
    <div className="orders-card">
      <div className="orders-header">
        <span className="orders-title">Recent Orders</span>
        <a href="#" className="view-all-link">View All Orders</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id">{order.id}</td>
              <td>{order.product}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td style={{ fontWeight: 600 }}>{order.amount}</td>
              <td>
                <span className={`status-badge ${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td>
                <button className="action-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}