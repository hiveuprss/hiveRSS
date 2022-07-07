
var frontEnds = [
  'hive',
  'peakd',
  'ulogs',
  'steempeak',
  'esteem',
  'ecency',
  'leofinance',
  'hivelist',
  'ctptalk',
  'sportstalk',
  'reggaejahm',
  'splintertalk',
  'weedcash',
  'hivehustlers',
  'naturalmedicine',
  'dunksocial',
  'wearealive',
  'musicforlife',
  'beatzchain',
  'blocktunes'
]


var getInterface = function (query) {
    if (query !== undefined && 
        Object.keys(query).length !== 0 &&
        query['interface'] !== undefined &&
        query['interface'] !== '') {
      if (frontEnds.includes(query['interface'])) {
        return query['interface']
      }
    } 
  return ''
}

var getLimit = function (query) {
   if (query !== undefined && 
      Object.keys(query).length !== 0 &&
      query['limit'] !== undefined &&
      query['limit'] !== '') {
      
      let limit = parseInt(query['limit'])

      if (!isNaN(limit)) {
        // clamp to range [0..50]
        limit = Math.max(limit, 0)
        limit = Math.min(limit, 50)
        return limit  
      }
    } 
  return 10 
}

var getMinVote = function (query) {
  if (query !== undefined && 
    Object.keys(query).length !== 0 &&
    query['minVotePct'] !== undefined &&
    query['minVotePct'] !== '') {

      let minVotePct = parseFloat(query['minVotePct'])

      if (!isNaN(minVotePct)) {
        // clamp to range [0..]
        minVotePct = Math.max(minVotePct, 0)
        return minVotePct  
      }
  }
  return 0
}

var getTagFilter = function (query) {
  if (query !== undefined && 
    Object.keys(query).length !== 0 &&
    query['tagFilter'] !== undefined &&
    query['tagFilter'] !== '' &&
    query['tagFilter'].length > 0 && 
    query['tagFilter'].length < 100) {

      let tagFilter = query['tagFilter'].toLowerCase()

      return tagFilter
  }
  return ''
}

var getRefer = function (query) {
  if (query != undefined && 
    Object.keys(query).length !== 0 &&
    query['ref'] !== undefined &&
    query['ref'] !== '' &&
    query['ref'].length > 0 && 
    query['ref'].length < 32) {

    let refer = query['ref'].toLowerCase()

    return refer
  }
  return ''
}


module.exports = {
    getInterface: getInterface,
    getLimit: getLimit,
    getMinVote: getMinVote,
    getTagFilter: getTagFilter,
    getRefer: getRefer
}