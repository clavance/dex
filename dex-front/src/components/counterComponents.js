import React, { Component } from 'react';

class Counter extends Component {
	state = { 
		id: 0,
		tags: [1,2,3,45,]
		//imageUrl: "https://picsum.photos/200"
	};

	styles = {
		fontSize: '20px',
		fontWeight: 'bold'
	};

	render() {
	    let classes = this.getBadgeClasses();

		return (
			<div>
			<img src={this.state.imageUrl} alt=""/>
			<span className={classes}>{this.formatCount()}</span>
			<button className="btn btn-secondary btn-sm">Increment</button>
            <div> {this.renderTags()} </div>
			</div>
		);
	}

	renderTags() {
	    if (this.state.tags.length === 0) return <p>There are no tags!</p>;
	    return <ul>{this.state.tags.map(tag => <li key={tag}> {tag} </li>)}</ul>
	}

    getBadgeClasses() {
        let classes = "badge m-2 badge-";
        classes += (this.state.id === 0) ? "warning" : "primary";
        return classes;
    }

	formatCount() {
		const { id } = this.state;
		
		return id === 0 ? "Zero" :id;
	}
}

export default Counter;