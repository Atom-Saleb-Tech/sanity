import {
  diff_match_patch as DiffMatchPatch,
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT
} from 'diff-match-patch'
import {StringDiffSegment, StringDiff, StringInput, DiffOptions} from '../types'

const dmp = new DiffMatchPatch()

export function diffString<A>(
  fromInput: StringInput<A>,
  toInput: StringInput<A>,
  options: DiffOptions
): StringDiff<A> {
  const fromValue = fromInput.value
  const toValue = toInput.value

  if (fromValue === toValue) {
    return {
      type: 'string',
      action: 'unchanged',
      isChanged: false,
      fromValue,
      toValue,
      segments: [{type: 'unchanged', text: fromValue}]
    }
  }

  return {
    type: 'string',
    action: 'changed',
    isChanged: true,
    fromValue,
    toValue,
    annotation: toInput.annotation,

    // Compute and memoize string segments only when accessed
    get segments(): StringDiffSegment<A>[] {
      delete this.segments
      this.segments = buildSegments(fromInput, toInput)
      return this.segments
    }
  }
}

function buildSegments<A>(
  fromInput: StringInput<A>,
  toInput: StringInput<A>
): StringDiffSegment<A>[] {
  let segments: StringDiffSegment<A>[] = []

  const dmpDiffs = dmp.diff_main(fromInput.value, toInput.value)
  dmp.diff_cleanupSemantic(dmpDiffs)

  let fromIdx = 0
  let toIdx = 0

  for (let [op, text] of dmpDiffs) {
    switch (op) {
      case DIFF_EQUAL:
        segments.push({type: 'unchanged', text})
        fromIdx += text.length
        toIdx += text.length
        break
      case DIFF_DELETE:
        for (let segment of fromInput.sliceAnnotation(fromIdx, fromIdx + text.length)) {
          segments.push({
            type: 'removed',
            text: segment.text,
            annotation: segment.annotation
          })
        }
        fromIdx += text.length
        break
      case DIFF_INSERT:
        for (let segment of toInput.sliceAnnotation(toIdx, toIdx + text.length)) {
          segments.push({
            type: 'added',
            text: segment.text,
            annotation: segment.annotation
          })
        }
        toIdx += text.length
        break
    }
  }

  return segments
}

export function removedString<A>(
  input: StringInput<A>,
  toValue: null | undefined,
  options: DiffOptions
): StringDiff<A> & {action: 'removed'} {
  return {
    type: 'string',
    action: 'removed',
    isChanged: true,
    fromValue: input.value,
    toValue,
    annotation: input.annotation,

    get segments(): StringDiffSegment<A>[] {
      delete this.segments
      this.segments = input
        .sliceAnnotation(0, input.value.length)
        .map(segment => ({type: 'removed', ...segment}))
      return this.segments
    }
  }
}

export function addedString<A>(
  input: StringInput<A>,
  fromValue: null | undefined,
  options: DiffOptions
): StringDiff<A> & {action: 'added'} {
  return {
    type: 'string',
    action: 'added',
    isChanged: true,
    fromValue,
    toValue: input.value,
    annotation: input.annotation,

    get segments(): StringDiffSegment<A>[] {
      delete this.segments
      this.segments = input
        .sliceAnnotation(0, input.value.length)
        .map(segment => ({type: 'added', ...segment}))
      return this.segments
    }
  }
}