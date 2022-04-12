import Vue from 'vue'

Vue.filter('formatDate', (value) => {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString(['en-US'], {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
