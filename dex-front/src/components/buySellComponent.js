import React, { Component } from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./component.css"
import Fade from 'react-reveal/Fade';

class InputForm extends Component {
    state = {}
    constructor() {
        super();
        this.handleBuySubmit = this.handleBuySubmit.bind(this);
        this.handleSellSubmit = this.handleSellSubmit.bind(this);
        this.handleBuyChange = this.handleBuyChange.bind(this);
        this.handleSellChange = this.handleSellChange.bind(this);

        this.state = {
            bid: null,
            token: null,
            trade_in: null,
            quantity: null,
            price: null
        }
    }

    handleBuySubmit = (event) => {
        event.preventDefault();
        this.setState({
            bid: true
        })
        console.log(this.state);
    }

    handleSellSubmit = (event) => {
        event.preventDefault();
        this.setState({
            bid: false
        })
        console.log(this.state);
    }

    handleBuyChange = (event) => {
        console.log(event)
        console.log(event.target.name)
        console.log(event.target.value)
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSellChange = (event) => {
            console.log(event)
            console.log(event.target.name)
            console.log(event.target.value)
            this.setState({
                [event.target.name]: event.target.value
            })
        }
    render() {
        return (
            <div className="forms">
                <div>
                <span onClick={this.handleClick} className="buy-badge"> BUY </span>
                <form className="buy-form" onSubmit={this.handleSubmit}>
                    <p><input type='text' placeholder="token" name='token' onChange={this.handleBuyChange}/></p>
                    <p><input type='text' placeholder="trade for" name='trade_in' onChange={this.handleBuyChange} /></p>
                    <p><input type='number' placeholder="amount" name='quantity' onChange={this.handleBuyChange} /></p>
                    <p><input type='number' placeholder="bid price" name='price' onChange={this.handleBuyChange} /></p>
                    <p><button onClick={
                           this.handleBuySubmit
                       } className="buy-button-badge" name="bid"> Bid </button></p>
                </form>
                </div>
                <div>
                    <span onClick={this.handleClick} className="sell-badge"> SELL </span>
                    <form className="sell-form" onSubmit={this.handleSubmit}>
                        <p><input type='text' placeholder="token" name='token' onChange={this.handleSellChange} /></p>
                        <p><input type='text' placeholder="trade for" name='trade_in' onChange={this.handleSellChange} /></p>
                        <p><input type='number' placeholder="amount" name='quantity' onChange={this.handleSellChange} /></p>
                        <p><input type='number' placeholder="ask price" name='price' onChange={this.handleSellChange} /></p>
                        <p><button onClick={
                                this.handleSellSubmit
                           } className="sell-button-badge" name="bid"> Ask </button></p>
                    </form>
                </div>
            </div>
        )
    }
}

export default InputForm