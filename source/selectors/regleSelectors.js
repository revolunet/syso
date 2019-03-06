/* @flow */

import { findRuleByDottedName } from 'Engine/rules'
import { encodeRuleName } from 'Engine/rules.js'
import { isNil, propEq } from 'ramda'
import { createSelector } from 'reselect'
import {
	branchAnalyseSelector,
	flatRulesSelector,
	situationsWithDefaultsSelector
} from './analyseSelectors'
import type { FlatRules } from 'Types/State'
import type {
	Règle,
	RègleAvecMontant,
	RègleValeur,
	RègleAvecValeur
} from 'Types/RegleTypes'
import type { Analysis } from 'Types/Analysis'
import type { InputSelector } from 'reselect'

export let ruleSelector = createSelector(
	branchAnalyseSelector,
	analysis => (dottedName: string): RègleValeur => {
		if (!analysis) {
			throw new Error(
				`[règleValeurSelector] L'analyse fournie ne doit pas être 'undefined' ou 'null'`
			)
		}
		let rule =
			analysis.cache[dottedName] ||
			analysis.targets.find(propEq('dottedName', dottedName))

		if (!rule) {
			throw new Error(`[ruleSelector] Unable to find the rule ${dottedName}`)
		}

		return rule
	}
)
