/* @flow */
import withLanguage from 'Components/utils/withLanguage'
import React from 'react'
import './Montant.css'

type Props = {
	children: number,
	className?: string,
	type: 'currency' | 'percent' | 'decimal',
	style?: { [string]: string },
	numFractionDigit?: number
} & ConnectedProps

type ConnectedProps = {
	language: string
}

const Montant = ({
	language,
	numFractionDigit = 2,
	children: value,
	className = '',
	style = {}
}: Props) => (
	<span className={'montant ' + className} style={style}>
		{value === 0 ? '—' : value}
	</span>
)

export default withLanguage(Montant)
