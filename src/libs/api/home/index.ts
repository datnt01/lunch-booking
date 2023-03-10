import { EventColection, EventDetailColection } from '@app/server/useDB'
import { store } from '@app/stores'
import { CollectionReference, getDocs, query, where } from 'firebase/firestore'
import { intersectionWith } from 'lodash'

const getBy = async <T = any>(cloection: CollectionReference<T>, params?: string) => {
  return (await getDocs(params ? query(cloection, where(params, '==', store.getState().USER.data?.uid)) : cloection)).docs.map((item) => ({
    ...item.data(),
    id: item.id,
  }))
}
export const getHomeData = async () => {
  const uid = store.getState().USER.data?.uid

  //list bữa ăn user chủ chi
  const allEvent = await getBy(EventColection)
  const isHost = allEvent.filter((item) => item.userPayId === uid)

  // số bữa ăn user tham gia
  const allEventDefail = await getBy(EventDetailColection)
  const isMember = allEventDefail.filter((item) => item.uid === uid)

  // list bữa ăn user chưa trả
  const unPaidList = isMember
    .filter((item) => !(item.isPaid || false))
    .map((item) => ({ ...item, eventName: allEvent.find((event) => event.id === item.eventId)?.eventName }))
  // list bữa ăn user chưa đòi
  const requirePaymentList = isHost
    .filter((item) => !item.isAllPaid)
    .map((item) => ({
      ...item,
      totalAmount:
        item.totalAmount! -
        allEventDefail.filter((event) => event.eventId === item.id && event.isPaid).reduce((sum, event) => sum + Number(event.amountToPay!), 0),
    }))

  const isMemberCount = isMember.length - intersectionWith(isMember, isHost, (members, hosts) => members.eventId === hosts.id).length

  return {
    isHostCount: isHost.length,
    // isMemberCount: isMember.length,
    isMemberCount: isMemberCount > 0 ? isMemberCount : 0,
    unPaidList,
    requirePaymentList,
  }
}

export const getHomeDataByUid = async (userUid: string) => {
  const allEvent = await getBy(EventColection)
  const isHost = allEvent.filter((item) => item.userPayId === userUid)

  // số bữa ăn user tham gia
  const allEventDetail = await getBy(EventDetailColection)
  const isMember = allEventDetail.filter((item) => item.uid === userUid)

  const isMemberCount = isMember.length - intersectionWith(isMember, isHost, (members, hosts) => members.eventId === hosts.id).length

  return {
    isHostCount: isHost.length,
    isMemberCount: isMemberCount > 0 ? isMemberCount : 0,
  }
}
