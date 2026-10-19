import { useState, useEffect } from "react";

export default function AdminPayment({ isAdmin = true }: { isAdmin?: boolean }) {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('0.1');
  const [reason, setReason] = useState('');
  const [paidUsers, setPaidUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kizazi_admin_paid') || '[]');
    setPaidUsers(saved);
  }, []);

  const handlePay = async () => {
    if (!username) { alert('Please enter username!'); return; }
    setLoading(true);
    try {
      const Pi = (window as any).Pi;
      if (!Pi) { alert('Please open this page in Pi Browser!'); setLoading(false); return; }
      
      await Pi.authenticate(['payments', 'username']);
      
      await Pi.createPayment({
        amount: parseFloat(amount),
        memo: reason || `Reward for ${username} - Kizazi Safari Lodge`,
        metadata: { username, reason, type: 'admin_reward' }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Approval:', paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          const newPaid = [...paidUsers, { username, amount, reason, txid, date: new Date().toLocaleString() }];
          setPaidUsers(newPaid);
          localStorage.setItem('kizazi_admin_paid', JSON.stringify(newPaid));
          alert(`Paid ${username} - ${amount} Pi successfully!`);
          setUsername(''); setReason('');
        },
        onCancel: () => alert('Payment cancelled'),
        onError: (e: any) => alert('Error: ' + e.message)
      });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div style={{padding:20}}>Access denied. Admin only.</div>;

  return (
    <div style={{maxWidth:500, margin:'20px auto', background:'#1e293b', color:'white', padding:20, borderRadius:15, fontFamily:'sans-serif'}}>
      <h2>🦁 Admin - Pay User Reward</h2>
      <p style={{color:'#94a3b8', fontSize:14}}>Pay any user Pi directly from App Wallet</p>
      
      <p>Progress: <b>{paidUsers.length}/5 - Mainnet Requirement</b></p>

      <label style={{fontSize:14}}>Pi Username</label>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g: juma123" style={{width:'95%', padding:12, margin:'6px 0 12px', borderRadius:8, border:'none'}} />

      <label style={{fontSize:14}}>Pi Amount</label>
      <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} step="0.1" style={{width:'95%', padding:12, margin:'6px 0 12px', borderRadius:8, border:'none'}} />

      <label style={{fontSize:14}}>Reason / Reward Note</label>
      <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g: Booking bonus, Monthly reward" style={{width:'95%', padding:12, margin:'6px 0 12px', borderRadius:8, border:'none'}} />

      <button onClick={handlePay} disabled={loading} style={{width:'100%', padding:14, background:'#7c3aed', color:'white', border:'none', borderRadius:10, fontWeight:'bold', fontSize:16, marginTop:10, cursor:'pointer'}}>
        {loading ? 'Processing...' : 'PAY NOW 💰'}
      </button>

      <div style={{marginTop:20}}>
        <h4>Paid Users</h4>
        {paidUsers.length===0 && <p style={{color:'#64748b', fontSize:13}}>No payments yet</p>}
        {paidUsers.map((p,i)=><div key={i} style={{background:'#334155', padding:10, margin:'5px 0', borderRadius:8, fontSize:14}}>✅ {p.username} - {p.amount} Pi - {p.reason} - {p.date}</div>)}
        {paidUsers.length>=5 && <div style={{background:'#16a34a', padding:12, marginTop:10, borderRadius:8, fontWeight:'bold'}}>🎉 5 Users Completed! Now you can apply for Mainnet Wallet in Pi Developer Portal!</div>}
      </div>
    </div>
  );
}
