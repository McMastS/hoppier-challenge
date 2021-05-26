import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { getMerchants, getTransactions, getUsers } from './utils/GraphQLData';

const Content = styled.div`
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const BigNumber = styled.h2`
  color: red;
`;

const Button = styled.button`
  width: 50px;
`;

// const Scroll = styled.div`
//   overflowY: 'scroll';
//   border: '1px solid black';
//   height: '800px';
// `;

const exchangeRate = 1.21;

const getTransactionAmount = (amountInUSDCents, currency) => {
  const dollars = currency === "USD" ? amountInUSDCents / 100 : (amountInUSDCents * exchangeRate) / 100;
  return dollars.toLocaleString("en-US", {style:"currency", currency: currency});
}

const Summary = (props) => {
  return (
    <BigNumber>{getTransactionAmount(props.totalSpent, props.currency)}</BigNumber>
  )
}

const Scroll = (props) => {
  return (
      <div style={{overflowY: 'scroll', border: '1px solid black', maxHeight: '800px', maxWidth:'800px'}}>
          {props.children}
      </div>
  )
};

const Transactions = (props) => {
  return (
    <Scroll>
      <table>
        <caption>All transactions made by users</caption>
        <tbody>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Merchant Name</th>
            <th>Card ID</th>
            <th>User First Name</th>
            <th>User Last Name</th>
          </tr>
          {props.transactions.map((transaction) => {
            const merchant = props.merchants.find(merchant => {
              return merchant.networkId === transaction.merchantNetworkId;
            });
            
            const user = props.users.find(user => {
              return user.cardId === transaction.cardId;
            });

            return (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{getTransactionAmount(transaction.amountInUSDCents, props.currency)}</td>
                <td>{transaction.date.toLocaleDateString()}</td>
                <td>{merchant?.name}</td>
                <td>{transaction.cardId}</td>
                <td>{user?.firstName}</td>
                <td>{user?.lastName}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Scroll>
  )
}

function App() {
  // const [isLoading, setIsLoading] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [isUSD, setIsUSD] = useState("USD");

  useEffect(() => {
    getTransactions()
      .then(res => setTransactions(res))
      .catch(error => console.log(error));

    getUsers()
      .then(res => setUsers(res))
      .catch(error => console.log(error));

    getMerchants()
      .then(res => setMerchants(res))
      .catch(error => console.log(error));
  }, [])

  const totalSpent = transactions.reduce((acc, transaction) => {
    return acc + transaction.amountInUSDCents;
  }, 0);

  const switchCurrency = () => {
    setIsUSD(!isUSD);
  }

  return (
    <Content>
      <h1>Transactions</h1>
      <Summary totalSpent={totalSpent} currency={isUSD ? "USD" : "CAD"} />
      <Button onClick={switchCurrency}>{isUSD ? "CAD" : "USD"}</Button>
      <Transactions transactions={transactions} merchants={merchants} users={users} currency={isUSD ? "USD" : "CAD"} />
    </Content>
  );
}

export default App;
