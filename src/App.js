// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
function App() {
  const createOrder = async () => {
    await fetch('http://localhost:4000/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: '123', customer: 'Ella', status: 'created' }),
    });
    alert('🚀 Order sent to Kafka!');
  };

  return (
    <div>
      <h1>Delivery App</h1>
      <button onClick={createOrder}>Create Order</button>
    </div>
  );
}

export default App;
