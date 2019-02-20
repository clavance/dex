import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import Counter from './components/counterComponents';
import Table from './components/tableComponents';
import Chart from './components/chartComponent';
import TransactionTable from './components/transactionTableComponent';
import InputForm from './components/buySellComponent';

ReactDOM.render(
    <div>
        <Table />
        <TransactionTable />
        <InputForm />
    </div>,
    document.getElementById('root')
   );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
