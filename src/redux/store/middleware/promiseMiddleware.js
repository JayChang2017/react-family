import axios from 'axios'

export default store => next => action => {
    const { dispatch, getState } = store
    /*如果dispatch来的是一个function，此处不做处理，直接进入下一级*/
    // 类似redux-thunk的做法
    if (typeof action === 'function') {
        // 交给redux-thunk做
        return next(action)
    }
    /*解析action*/
    const { promise, types, onSuccess, onError, ...rest } = action

    /*没有promise，证明不是想要发送ajax请求的，就直接进入下一步啦！*/
    if (!action.promise) {
        return next(action)
    }

    /*解析types*/
    const [REQUEST, SUCCESS, FAILURE] = types

    /*开始请求的时候，发一个action*/
    next({
        payload: { ...rest },
        type: REQUEST,
    })
    /*定义请求成功时的方法*/
    const onFulfilled = result => {
        next({
            type: SUCCESS,
        })
        if (onSuccess) {
            onSuccess(dispatch, getState, result)
        }
    }
    /*定义请求失败时的方法*/
    const onRejected = error => {
        next({
            type: FAILURE,
        })
        if (onError) {
            onError(error)
        }
    }

    return promise(axios)
        .then(onFulfilled, onRejected)
        .catch(error => {
            console.error('MIDDLEWARE ERROR:', error)
            onRejected(error)
        })
}