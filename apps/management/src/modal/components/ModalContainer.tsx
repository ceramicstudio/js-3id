import styles from './ModalContainer.module.scss'
import HeaderContainer from './HeaderContainer'
import ModalFooter from './ModalFooter'
import ModalContent from './ModalContent'
import React, { useState, useEffect, useCallback } from 'react';
import { ThreeIDManagerUI, } from '@3id/ui-provider'
import {initAtom } from '../state'
import { useAtom } from 'jotai'
// @ts-ignore
import * as hexToRgb from 'hex-to-rgb'
  
// TODO MOVE
const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`


export default function ModalContainer() {
  useAtom(initAtom)
  return(
    <div className={styles.App} style={{ backgroundColor: `${hexToRGBA('#e4e4e4')}` }}>
      <div className={styles.modal}>
        <HeaderContainer />
        <ModalContent />
        <ModalFooter/>
      </div>
    </div>
  )
}
  