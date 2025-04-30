import type {ReactNode} from 'react'

export function Card({title, children}: { title: string, children?: ReactNode, className?: string }) {
    return (<div className="flex flex-col gap-4  rounded-lg shadow-lg p-4 border-1 border-gray-300">
            <div>{title}</div>
            {children}
        </div>
    )
}
