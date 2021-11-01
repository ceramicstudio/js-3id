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
  return(
    <div className={styles.modal}>
      <HeaderContainer />
      <ModalContent />
      <ModalFooter/>
    </div>
  )
}
  