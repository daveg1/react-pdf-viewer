# React PDF Viewer

A PDF viewer made in React. Keeping this here as a reference for future projects.

## Features

- paging
- bookmarking/highlighting system
- zooming (half working atm)
- keyboard shortcuts
- state persistence across each document you open

## Tech

- [react-pdf](https://github.com/wojtekmaj/react-pdf) to read + display the PDF
- [tanstack virtual](https://github.com/tanstack/virtual) to virtualise the list of pages

## Future notes

- should use a proper state management system
- could avoid virtualising the pages to avoid flickering when scrolling
- would like to add note/annotation editing
