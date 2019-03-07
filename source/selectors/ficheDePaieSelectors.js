/* @flow */
import {
	add,
	concat,
	filter,
	groupBy,
	map,
	mergeWith,
	mergeWithKey,
	path,
	pathOr,
	pipe,
	prop,
	reduce,
	values
} from 'ramda'
import { createSelector } from 'reselect'
import { analysisWithDefaultsSelector } from 'Selectors/analyseSelectors'
import {
	règleAvecMontantSelector,
	règleAvecValeurSelector,
	règleLocaliséeSelector
} from 'Selectors/regleSelectors'

import type { Analysis } from 'Types/Analysis'
import type {
	VariableWithCotisation,
	Cotisation,
	Cotisations,
	Branche,
	FicheDePaie
} from 'Types/ResultViewTypes'

import type { Règle } from 'Types/RegleTypes'

export const COTISATION_BRANCHE_ORDER: Array<Branche> = [
	'protection sociale . santé',
	'protection sociale . accidents du travail et maladies professionnelles',
	'protection sociale . retraite',
	'protection sociale . famille',
	'protection sociale . assurance chômage',
	'protection sociale . formation',
	'protection sociale . transport',
	'protection sociale . autres'
]

// Used for type consistency
export const BLANK_COTISATION: Cotisation = {
	montant: {
		partPatronale: 0,
		partSalariale: 0
	},
	id: 'ERROR_SHOULD_BE_INSTANCIATED',
	type: 'euros',
	nom: 'ERROR_SHOULD_BE_INSTANCIATED',
	lien: 'ERROR_SHOULD_BE_INSTANCIATED',
	branche: 'protection sociale . autres'
}

function duParSelector(
	variable: VariableWithCotisation
): ?('employeur' | 'employé') {
	const dusPar = [
		['cotisation', 'dû par'],
		['taxe', 'dû par'],
		['explanation', 'cotisation', 'dû par'],
		['explanation', 'taxe', 'dû par']
	].map(p => path(p, variable))
	return dusPar.filter(Boolean)[0]
}
function brancheSelector(variable: VariableWithCotisation): Branche {
	const branches = [
		['cotisation', 'branche'],
		['taxe', 'branche'],
		['explanation', 'cotisation', 'branche'],
		['explanation', 'taxe', 'branche']
	].map(p => path(p, variable))
	return (
		// $FlowFixMe
		'protection sociale . ' + (branches.filter(Boolean)[0] || 'autres')
	)
}

// $FlowFixMe
export const mergeCotisations: (
	Cotisation,
	Cotisation
) => Cotisation = mergeWithKey((key, a, b) =>
	key === 'montant' ? mergeWith(add, a, b) : b
)

const variableToCotisation = (règleLocaliséeSelector: string => Règle) => (
	variable: VariableWithCotisation
): Cotisation => {
	return mergeCotisations(BLANK_COTISATION, {
		...règleLocaliséeSelector(variable.dottedName),
		branche: brancheSelector(variable),
		montant: {
			[duParSelector(variable) === 'salarié'
				? 'partSalariale'
				: 'partPatronale']: variable.nodeValue
		}
	})
}
const groupByBranche = (règleLocaliséeSelector: string => Règle) => (
	cotisations: Array<Cotisation>
): Cotisations => {
	const cotisationsMap = cotisations.reduce(
		(acc, cotisation) => ({
			...acc,
			[cotisation.branche]: [cotisation, ...(acc[cotisation.branche] || [])]
		}),
		{}
	)
	return COTISATION_BRANCHE_ORDER.map(branche => [
		règleLocaliséeSelector(branche),
		// $FlowFixMe
		cotisationsMap[branche]
	])
}
const analysisToCotisations = (
	analysis: Analysis,
	règleLocaliséeSelector: string => Règle
): Cotisations => {
	const variables = [
		'contrat salarié . cotisations . salariales',
		'contrat salarié . cotisations . patronales'
	]
		.map(name => analysis.cache[name])
		.map(pathOr([], ['explanation', 'formule', 'explanation', 'explanation']))
		.reduce(concat, [])

	const cotisations = pipe(
		groupBy(prop('dottedName')),
		values,
		map(
			pipe(
				map(variableToCotisation(règleLocaliséeSelector)),
				reduce(mergeCotisations, BLANK_COTISATION)
			)
		),
		filter(
			cotisation =>
				cotisation.montant.partPatronale !== 0 ||
				cotisation.montant.partSalariale !== 0
		),
		groupByBranche(règleLocaliséeSelector),
		filter(([, brancheCotisation]) => !!brancheCotisation)
	)(variables)
	return cotisations
}
// $FlowFixMe
export default createSelector(
	[
		règleAvecMontantSelector,
		règleAvecValeurSelector,
		règleLocaliséeSelector,
		analysisWithDefaultsSelector
	],
	analysisToFicheDePaie
)
