export default { parse }

function parse (fullString, stringArray, substring) {
  const res = []
  // if no substring provided, return all the strings from source array wrapped with {left:}
  if (!substring) {
    return stringArray.map(sourceString => {
      return { left: sourceString }
    })
  }

  const substringStarts = fullString.indexOf(substring)
  const substringEnds = fullString.indexOf(substring) + substring.length

  let prevCounter = 0
  let a = { start: substringStarts, end: substringEnds }
  stringArray.forEach(string => {
    let b = { start: prevCounter, end: prevCounter + string.length }

    if (a.start <= b.end && a.end >= b.start) {
      const intersectionData = findIntersection(substring, string)
      let left = null
      let middle = null
      let right = null
      if (intersectionData.position !== 0) {
        left = string.substring(0, intersectionData.position)
      }
      middle = string.substring(intersectionData.position, intersectionData.position + intersectionData.length)
      if (intersectionData.position + intersectionData.length < string.length) {
        right = string.substring(intersectionData.position + intersectionData.length, string.length)
      }

      res.push({ left, middle, right })
    } else {
      res.push({ left: string })
    }
    prevCounter += string.length + 1
  })

  return res
}

function findIntersectionFromStart (a, b) {
  for (let i = a.length; i > 0; i--) {
    let d = a.substring(0, i)
    let j = b.indexOf(d)
    if (j >= 0) {
      return { position: j, length: i }
    }
  }
  return null
}

function findIntersection (a, b) {
  let bestResult = null
  for (let i = 0; i < a.length - 1; i++) {
    const result = findIntersectionFromStart(a.substring(i), b)
    if (result) {
      if (!bestResult) {
        bestResult = result
      } else {
        if (result.length > bestResult.length) {
          bestResult = result
        }
      }
    }
    if (bestResult && bestResult.length >= a.length - i) break
  }
  return bestResult
}
