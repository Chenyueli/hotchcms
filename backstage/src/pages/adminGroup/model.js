/* global window */
import modelExtend from 'dva-model-extend'
import { create, remove, update } from './services/adminGroup'
import * as adminGroupsService from './services/adminGroups'
import * as authorityService from './services/authority'
import { pageModel } from 'utils/model'

const { query, multi } = adminGroupsService

export default modelExtend(pageModel, {
  namespace: 'adminGroup',

  state: {
    currentItem: {},
    authority: [],
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/adminGroup') {
          const payload = location.query || { page: 1, pageSize: 10 }
          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    },
  },

  effects: {

    * query ({ payload = {} }, { call, put }) {
      const data = yield call(query, payload)
      if (data.code === '0000') {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.result.list,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: data.result.total,
            },
          },
        })
      } else {
        throw data
      }
    },

    * queryAuthority ({ payload = {} }, { call, put }) {
      const data = yield call(authorityService.query, payload)
      if (data.code === '0000') {
        yield put({
          type: 'updateState',
          payload: {
            authority: data.result,
          },
        })
      } else {
        throw data
      }
    },

    * delete ({ payload }, { call, put, select }) {
      const data = yield call(remove, { _id: payload })
      const { selectedRowKeys } = yield select(_ => _.adminGroup)
      if (data.code === '0000') {
        yield put({ type: 'updateState', payload: { selectedRowKeys: selectedRowKeys.filter(_ => _ !== payload) } })
      } else {
        throw data
      }
    },

    * multiDelete ({ payload }, { call, put }) {
      const data = yield call(multi, { type: 'remove', ...payload })
      if (data.code === '0000') {
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    * create ({ payload }, { call, put }) {
      const data = yield call(create, payload)
      if (data.code === '0000') {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

    * update ({ payload }, { select, call, put }) {
      const _id = yield select(({ adminGroup }) => adminGroup.currentItem._id)
      const newAdminGroup = { ...payload, _id }
      const data = yield call(update, newAdminGroup)
      if (data.code === '0000') {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

  },

  reducers: {

    showModal (state, { payload }) {
      return { ...state, ...payload, modalVisible: true }
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },

  },
})
