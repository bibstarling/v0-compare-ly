import type React from "react"
interface IPhoneFrameProps {
  children: React.ReactNode
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-8">
      {/* iPhone 14 Device Frame */}
      <div id="phone-container" className="relative" style={{ width: "390px", height: "844px" }}>
        {/* Device Bezel */}
        <div
          className="absolute inset-0 rounded-[45px] bg-black shadow-2xl"
          style={{
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 8px #000",
          }}
        >
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 flex h-11 items-center justify-between px-8 pt-2 text-xs text-white">
            <span className="font-semibold">9:41</span>
            <div className="absolute left-1/2 top-0 h-7 w-36 -translate-x-1/2 rounded-b-3xl bg-black"></div>
            <div className="flex items-center gap-1">
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="opacity-80">
                <path
                  d="M0 4.5C0 3.67157 0.671573 3 1.5 3H2.5C3.32843 3 4 3.67157 4 4.5V7.5C4 8.32843 3.32843 9 2.5 9H1.5C0.671573 9 0 8.32843 0 7.5V4.5Z"
                  fill="white"
                />
                <path
                  d="M5.5 2.5C5.5 1.67157 6.17157 1 7 1H8C8.82843 1 9.5 1.67157 9.5 2.5V9.5C9.5 10.3284 8.82843 11 8 11H7C6.17157 11 5.5 10.3284 5.5 9.5V2.5Z"
                  fill="white"
                />
                <path
                  d="M11 1.5C11 0.671573 11.6716 0 12.5 0H13.5C14.3284 0 15 0.671573 15 1.5V10.5C15 11.3284 14.3284 12 13.5 12H12.5C11.6716 12 11 11.3284 11 10.5V1.5Z"
                  fill="white"
                />
              </svg>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="opacity-80">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.5 2C5.73858 2 3.5 4.23858 3.5 7C3.5 9.76142 5.73858 12 8.5 12C11.2614 12 13.5 9.76142 13.5 7C13.5 4.23858 11.2614 2 8.5 2ZM0.5 7C0.5 2.58172 4.08172 -1 8.5 -1C12.9183 -1 16.5 2.58172 16.5 7C16.5 11.4183 12.9183 15 8.5 15C4.08172 15 0.5 11.4183 0.5 7Z"
                  fill="white"
                />
              </svg>
              <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
                <rect opacity="0.35" x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="white" />
                <path
                  opacity="0.4"
                  d="M23.5 4V8C24.8807 7.66122 26 6.42778 26 5C26 3.57222 24.8807 2.33878 23.5 2V4Z"
                  fill="white"
                />
                <rect x="2" y="2" width="18" height="8" rx="1" fill="white" />
              </svg>
            </div>
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-[45px] bg-background pt-11">
            <div className="relative h-full w-full overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
