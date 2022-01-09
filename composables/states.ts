import { useState } from '#app'

export const useLoadStatus = () => useState<boolean>('isLoading', () => {
    return false
})
export const useBlogSettings = () => useState<object>('blogSettings', () => {
    return {}
})
export const useStoreBlogSettings = () => useState<boolean>('storeBlogSettings', () => {
    return false
})
export const useHeadMessage = () => useState<string>('headMessage', () => {
    return ''
})
export const useErrorMessage = () => useState<string>('errorMessage', () => {
    return ''
})
