import { API } from '~/plugins/api';
import { MM } from '~/plugins/mm';

export default ({ store }, inject) => {
  const api = new API(err => store.commit('app/setError', err))
  const mm = new MM()

  inject('api', api)
  inject('mm', mm)
}
