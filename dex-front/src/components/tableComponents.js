import React, { Component } from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./component.css"
import Fade from 'react-reveal/Fade';

class Table extends Component {
    /*
    state = {
        columns: ['Coin', 'Quantity', 'Value (USD)'],
        rows: [{
            'Coin': 'ETH',
                'Quantity': 5000,
                'Value (USD)': 60000
              }, {
                'Coin': 'XBP',
                'Quantity': 50,
                'Value (USD)': 2000
              }
        ]
    }
    */

    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
    }
    state = {
            hide: false,
            columns: [{Header: 'Coin', accessor: 'coin', width: 50}, {Header: 'Quantity', accessor: 'quantity', width: 100}, {Header: 'Value (USD)', accessor: 'value', width: 100}],
            rows: [{
                'coin': 'ETH',
                    'quantity': 5000,
                    'value': 60000
                  }, {
                    'coin': 'XBP',
                    'quantity': 50,
                    'value': 2000
                  }, {
                    'coin': 'XAE',
                    'quantity': 50,
                     'value': 200
                  }
            ]
        }

    /*
    render() {

        var dataColumns = this.state.columns;
        var dataRows = this.state.rows;

        var tableHeaders = (<thead className="thead-dark" ><tr>{dataColumns.map(function(column) {return <th>{column}</th>; })}</tr></thead>);
        var tableBody = dataRows.map(function(row) {
            return (<tr>{dataColumns.map(function(column) { return <td>{row[column]}</td>; })}</tr>); });


        return (<table className="table table-striped width=50%">
                {tableHeaders}
                {tableBody}
              </table>);
    }
    */
    handleClick() {
        //this.state.hide = !this.state.hide;
        this.setState({hide: !this.state.hide})
    }

    render() {
        return (
            <div>
                <Fade left>
                    <span className="account-header">Good evening, welcome to your account</span>

                <button onClick={this.handleClick} className="badge"> Your wallet</button>
                {this.state.hide === false ?
                <ReactTable className="-striped -highlight"
                    data = {this.state.rows}
                    columns= {this.state.columns}
                    defaultPageSize = {5}
                    style={{height: '200px', width: '500px', margin: '10px 50px'}}
                    showPagination={false}
                /> : <span> </span> }
                </Fade>
            </div>
        )
    }

}

export default Table;