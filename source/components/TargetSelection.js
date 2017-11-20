import React, { Component } from 'react'
import { rules } from 'Engine/rules'
import { propEq, reject } from 'ramda'
import { Link } from 'react-router-dom'
import './TargetSelection.css'

export default class TargetSelection extends Component {
	state = {
		targets: []
	}
	render() {
		let { targets } = this.state

		return (
			<section id="targetSelection">
				<h2>Qu'allons-nous calculer ?</h2>
				{this.renderOutputList()}
				{targets.length !== 0 && (
					<Link to={'/simu/' + targets.join('+')}>
						<button>Valider</button>
					</Link>
				)}
			</section>
		)
	}

	renderOutputList() {
		let salaires = rules.filter(propEq('type', 'salaire')),
			{ targets } = this.state
		return (
			<div>
				{salaires.map(s => (
					<span>
						<input
							id={s.name}
							type="checkbox"
							checked={targets.includes(s.name)}
							onChange={() =>
								this.setState({
									targets: targets.find(t => t === s.name)
										? reject(t => t === s.name, targets)
										: [...targets, s.name]
								})
							}
						/>
						<label for={s.name} key={s.name}>
							<i className="fa fa-square-o fa-2x" />
							<i className="fa fa-check-square-o fa-2x" />
							<div>
								<span className="optionTitle">{s.title || s.name}</span>
								<p>{s['résumé']}</p>
							</div>
						</label>
					</span>
				))}
			</div>
		)
	}
}
