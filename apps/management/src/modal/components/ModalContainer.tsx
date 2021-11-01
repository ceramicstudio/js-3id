import styles from './ModalContainer.module.scss'
import HeaderContainer from './HeaderContainer'
import ModalFooter from './ModalFooter'
import ModalContent from './ModalContent'
import { useThreeIDService } from '../uiProvider'
import React, { useState, useEffect, useCallback } from 'react';
import { ThreeIDManagerUI, } from '@3id/ui-provider'
import {reqStateAtom } from '../state'
import { useAtom } from 'jotai'
  
export default function ModalContainer() {
  const [provider] = useThreeIDService()
  const [reqState, ] = useAtom(reqStateAtom)
 
  const login = useCallback(() => {
    const uimanager = new ThreeIDManagerUI(provider())
    uimanager.promptMigration({ legacyDid: ''})
  }, [])

  return(
    <div className={styles.modal}>
      <HeaderContainer />
      <button onClick={login} />
      <ModalContent />
      <ModalFooter/>
    </div>
  )
}
  