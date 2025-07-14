'use client'

import { useEffect, useRef } from 'react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    tension?: number
  }[]
}

interface AnalyticsChartProps {
  data: ChartData
  type?: 'line' | 'bar'
  height?: number
}

export function AnalyticsChart({ data, type = 'line', height = 300 }: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Simple chart implementation
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = height - padding * 2

    // Find max value
    const allValues = data.datasets.flatMap(dataset => dataset.data)
    const maxValue = Math.max(...allValues, 1)

    // Draw axes
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(rect.width - padding, height - padding)
    ctx.stroke()

    // Draw data
    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.borderColor || `hsl(${datasetIndex * 120}, 70%, 50%)`
      
      if (type === 'line') {
        // Draw line chart
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()

        dataset.data.forEach((value, index) => {
          const x = padding + (index / (data.labels.length - 1)) * chartWidth
          const y = height - padding - (value / maxValue) * chartHeight

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.stroke()

        // Draw points
        ctx.fillStyle = color
        dataset.data.forEach((value, index) => {
          const x = padding + (index / (data.labels.length - 1)) * chartWidth
          const y = height - padding - (value / maxValue) * chartHeight

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        })
      } else {
        // Draw bar chart
        const barWidth = chartWidth / data.labels.length * 0.8
        const barSpacing = chartWidth / data.labels.length * 0.2

        ctx.fillStyle = dataset.backgroundColor || color
        dataset.data.forEach((value, index) => {
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
          const barHeight = (value / maxValue) * chartHeight
          const y = height - padding - barHeight

          ctx.fillRect(x, y, barWidth, barHeight)
        })
      }
    })

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    
    // X-axis labels
    data.labels.forEach((label, index) => {
      const x = padding + (index / (Math.max(data.labels.length - 1, 1))) * chartWidth
      ctx.fillText(label, x, height - padding + 20)
    })

    // Y-axis labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const value = (maxValue * i) / 4
      const y = height - padding - (i / 4) * chartHeight
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4)
    }

    // Legend
    if (data.datasets.length > 1) {
      ctx.textAlign = 'left'
      data.datasets.forEach((dataset, index) => {
        const color = dataset.borderColor || `hsl(${index * 120}, 70%, 50%)`
        const x = rect.width - 150
        const y = padding + index * 20

        ctx.fillStyle = color
        ctx.fillRect(x, y - 10, 15, 15)
        
        ctx.fillStyle = '#374151'
        ctx.fillText(dataset.label, x + 20, y)
      })
    }

  }, [data, type, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="border border-gray-200 rounded-lg"
    />
  )
}