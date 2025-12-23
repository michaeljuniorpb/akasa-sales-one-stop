
import React from 'react';
import { SalesFile } from './types';

export const TENOR_YEARS_OPTIONS = [5, 10, 15, 20];

export const MOCK_FILES: SalesFile[] = [
  {
    id: '1',
    title: 'Brosur Akasa Pure Living - E-Brochure 2024',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tags: ['brosur', 'marketing'],
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    title: 'Price List - Cluster Akasa Signature (Q1 2024)',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tags: ['harga', 'promo'],
    updatedAt: '2024-03-20'
  },
  {
    id: '3',
    title: 'Skema Promo Cashback & Free Provisi',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tags: ['promo'],
    updatedAt: '2024-03-18'
  },
  {
    id: '4',
    title: 'Site Plan - Akasa Pure Living Phase 2',
    type: 'image',
    url: 'https://picsum.photos/seed/akasa-siteplan/1200/800',
    tags: ['unit', 'layout'],
    updatedAt: '2024-02-10'
  },
  {
    id: '5',
    title: 'Foto Show Unit - Tipe 2BR (Furnished)',
    type: 'image',
    url: 'https://picsum.photos/seed/akasa-unit/1200/800',
    tags: ['unit', 'foto'],
    updatedAt: '2024-02-12'
  }
];

export const ICONS = {
  Calc: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-3V18m-3-3V18M4.5 3.75h15a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25zM12.75 7.5h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12.75 10.5h.008v.008h-.008V10.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 7.5h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 10.5h.008v.008h-.008V10.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15.75 7.5h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15.75 10.5h.008v.008h-.008V10.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Folder: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.31c-.191 0-.372-.072-.51-.201z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  PDF: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Link: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
};
