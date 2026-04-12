'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Skeleton from '@/components/Skeleton';
import { format } from 'date-fns';
import { FiArrowUpRight, FiArrowDownLeft, FiFilter, FiSearch, FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import styles from './transactions.module.css';

interface Transaction {
  id: number;
  transactionId: string;
  type: string;
  status: string;
  amount: string;
  recipientName?: string;
  recipientEmail?: string;
  externalBankName?: string;
  memo?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  useEffect(() => {
    let result = transactions;

    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.transactionId.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term) ||
        t.recipientName?.toLowerCase().includes(term) ||
        t.recipientEmail?.toLowerCase().includes(term) ||
        t.amount.toString().includes(term)
      );
    }

    setFilteredTransactions(result);
  }, [filterStatus, searchTerm, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!selectedTransaction || !disputeMessage) return;

    try {
      const response = await fetch('/api/transactions/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          disputeMessage,
        }),
      });

      if (response.ok) {
        setDisputeSuccess(true);
        setDisputeMessage('');
        fetchTransactions();
        setTimeout(() => {
          setDisputeSuccess(false);
          setShowDispute(false);
          setSelectedTransaction(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error disputing transaction:', error);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Transaction History</h2>
            <p>View and manage your account activity</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <FiSearch />
              <input
                type="text"
                placeholder="Search by ID, recipient, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <FiFilter />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>

          <div className={styles.transactionCard}>
            {loading ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Transaction</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array(8).fill(0).map((_, i) => (
                      <tr key={i} className={styles.tr}>
                        <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                        <td className={styles.td}><Skeleton variant="text" width="150px" /></td>
                        <td className={styles.td}><Skeleton variant="text" width="60px" /></td>
                        <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Transaction</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className={styles.tr} onClick={() => setSelectedTransaction(t)}>
                        <td className={styles.td}>{format(new Date(t.createdAt), 'MMM dd, yyyy')}</td>
                        <td className={styles.td}>
                          <div className={styles.tName}>
                            {t.type.replace('_', ' ')}
                            <span>{t.transactionId}</span>
                          </div>
                        </td>
                        <td className={`${styles.td} ${parseFloat(t.amount) < 0 || t.type.includes('transfer') ? styles.negative : styles.positive}`}>
                          {parseFloat(t.amount) < 0 || t.type.includes('transfer') ? '-' : '+'}${Math.abs(parseFloat(t.amount)).toFixed(2)}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${t.status.toLowerCase()}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>No transactions found matching your criteria.</div>
            )}
          </div>

          {selectedTransaction && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Transaction Details</h3>
                  <button onClick={() => {
                    setSelectedTransaction(null);
                    setShowDispute(false);
                  }}><FiX /></button>
                </div>

                <div className={styles.modalBody}>
                  {!showDispute ? (
                    <>
                      <div className={styles.detailAmount}>
                        <span className={parseFloat(selectedTransaction.amount) < 0 || selectedTransaction.type.includes('transfer') ? styles.negative : styles.positive}>
                          {parseFloat(selectedTransaction.amount) < 0 || selectedTransaction.type.includes('transfer') ? '-' : '+'}${Math.abs(parseFloat(selectedTransaction.amount)).toFixed(2)}
                        </span>
                        <p>{selectedTransaction.status}</p>
                      </div>

                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span>Transaction ID</span>
                          <strong>{selectedTransaction.transactionId}</strong>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Date & Time</span>
                          <strong>{format(new Date(selectedTransaction.createdAt), 'PPP p')}</strong>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Type</span>
                          <strong>{selectedTransaction.type.replace('_', ' ').toUpperCase()}</strong>
                        </div>
                        {selectedTransaction.recipientName && (
                          <div className={styles.detailItem}>
                            <span>Recipient</span>
                            <strong>{selectedTransaction.recipientName}</strong>
                          </div>
                        )}
                        {selectedTransaction.memo && (
                          <div className={styles.detailItem}>
                            <span>Note</span>
                            <strong>{selectedTransaction.memo}</strong>
                          </div>
                        )}
                      </div>

                      <div className={styles.modalActions}>
                        <button className="btn btn-secondary" onClick={() => window.print()}>View Receipt</button>
                        {selectedTransaction.status !== 'DISPUTED' && (
                          <button className={styles.disputeBtn} onClick={() => setShowDispute(true)}>Dispute Transaction</button>
                        )}
                      </div>
                    </>
                  ) : disputeSuccess ? (
                    <div className={styles.disputeResult}>
                      <FiCheckCircle size={48} className={styles.successIcon} />
                      <h3>Dispute Submitted</h3>
                      <p>Your dispute for transaction {selectedTransaction.transactionId} has been received and is being reviewed.</p>
                    </div>
                  ) : (
                    <div className={styles.disputeForm}>
                      <div className={styles.disputeHeader}>
                        <FiAlertTriangle />
                        <h4>Dispute this transaction?</h4>
                      </div>
                      <p>Please provide a reason for disputing this transaction. Our team will review it within 2-3 business days.</p>
                      <textarea
                        value={disputeMessage}
                        onChange={(e) => setDisputeMessage(e.target.value)}
                        placeholder="Reason for dispute (e.g., Unrecognized charge, Incorrect amount)..."
                      />
                      <div className={styles.modalActions}>
                        <button className="btn btn-secondary" onClick={() => setShowDispute(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleDispute} disabled={!disputeMessage}>Submit Dispute</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
