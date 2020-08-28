import React from 'react'
import {
  DiffComponent,
  // DatetimeDiff,
  DiffAnnotationTooltip,
  useDiffAnnotationColor
} from '@sanity/field/diff'
import styles from '../shared/BlockSegmentStyles.css'
import {getDateFormat} from './helpers'
import {DiffLayout} from '../shared'

// TODO: fix DatetimeDiff

export const DatetimeFieldDiff /* : DiffComponent<DatetimeDiff> */ = ({diff, schemaType}) => {
  const {fromValue, toValue} = diff
  const color = useDiffAnnotationColor(diff, [])
  const style = color ? {background: color.background, color: color.text} : {}
  const fromDate = getDateFormat(fromValue, schemaType.name, schemaType.options)
  const toDate = getDateFormat(toValue, schemaType.name, schemaType.options)
  return (
    <DiffAnnotationTooltip className={styles.root} diff={diff}>
      <DiffLayout
        renderFrom={
          fromValue !== undefined && (
            <del className={`${styles.segment} ${styles.add}`} style={style}>
              {fromDate}
            </del>
          )
        }
        renderTo={
          toValue && (
            <ins className={`${styles.segment} ${styles.remove}`} style={style}>
              {toDate}
            </ins>
          )
        }
      />
    </DiffAnnotationTooltip>
  )
}
