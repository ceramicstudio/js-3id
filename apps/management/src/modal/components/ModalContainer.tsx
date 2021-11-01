import styles from './ModalContainer.module.scss'
import HeaderContainer from './HeaderContainer'
import ModalFooter from './ModalFooter'
import ModalContent from './ModalContent'
// import('../uiProvider')
// console.log('ooo')
import { useThreeIDService } from '../uiProvider'
import React, { useState, useEffect, useCallback } from 'react';
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, } from '@3id/ui-provider'
import { resStatusAtom, reqStateAtom } from '../state'
import { useAtom } from 'jotai'
  
export default function ModalContainer() {
  const [provider] = useThreeIDService()
  const [responseStatus, setResponseStatus] = useAtom(resStatusAtom)
 
  const login = useCallback(() => {
    const uimanager = new ThreeIDManagerUI(provider())
    uimanager.promptMigration({ legacyDid: ''})
  }, [])
  // login()

  return(
    <div className={styles.modal}>
      <HeaderContainer />
      hello
      <button onClick={login} />
      hello
      <button onClick={()=>responseStatus?.promise.resolve(true)} />
      <ModalContent />
      <ModalFooter/>
    </div>
  )
}
  