'use client'

import { useState } from 'react'

export default function AboutModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass-button rounded-full w-7 h-7 flex items-center justify-center text-xs text-gray-400 hover:text-accent transition-colors"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <div
            className="glass-overlay rounded-3xl p-8 max-w-lg w-full relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-foreground transition-colors text-lg"
            >
              &times;
            </button>

            <h2 className="font-serif text-2xl mb-6">what is parallax?</h2>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                parallax helps content creators find ideas faster and coordinate
                so nobody makes the same video twice.
              </p>

              <p className="font-medium text-foreground">how it works:</p>

              <ol className="space-y-3 list-none">
                <li className="flex gap-3">
                  <span className="text-accent font-medium shrink-0">1.</span>
                  <span>someone submits a research paper, article, or any interesting text.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-medium shrink-0">2.</span>
                  <span>it gets distilled into a short summary, key points, and suggested creative angles.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-medium shrink-0">3.</span>
                  <span>you browse the angles, see what others have already claimed, and pick your own unique take.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-medium shrink-0">4.</span>
                  <span>make your content, link it back, and the whole group ends up covering one topic from many perspectives.</span>
                </li>
              </ol>

              <p>
                that&apos;s it. no accounts, no algorithms. just a shared space
                to turn research into content without stepping on each other&apos;s toes.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
