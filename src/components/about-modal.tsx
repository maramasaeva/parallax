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
                so basically parallax is a tool for creators who want to make content about
                interesting stuff without accidentally making the exact same video as someone else.
              </p>

              <p>
                the feed pulls in research papers, news, and articles from all over the place
                every day. ai breaks each one down into a quick summary, the key points,
                and a bunch of creative angles you could take on it.
              </p>

              <p>
                you scroll through, find something that sparks, and claim your angle. you can
                see what angles other people already claimed so you know what&apos;s taken and
                what&apos;s still open. one topic, many perspectives, no overlap.
              </p>

              <p>
                if you make a profile it learns what you&apos;re into, what kind of content you
                make, and who your audience is. then it can recommend topics and even suggest
                a personalized angle that fits your style.
              </p>

              <p>
                once you&apos;ve made your thing you link it back and now there&apos;s this whole
                collection of creators covering the same topic from totally different directions.
                that&apos;s the whole point. same source material, different minds, different output.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
