import Matter from 'matter-js'
import React, { useEffect, useRef } from 'react'

export default function RopeSimulation() {
    const canvasRef = useRef(null)

    useEffect(() => {
        // 初始化 Matter.js 引擎
        const {
            Engine,
            Render,
            Runner,
            Bodies,
            Body,
            Composite,
            Composites,
            Constraint,
            Mouse,
            MouseConstraint,
            Events
        } = Matter

        // 创建引擎
        const engine = Engine.create()
        const world = engine.world

        // 创建渲染器
        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: {
                width: 800,
                height: 600,
                showAngleIndicator: true,
                showCollisions: true,
                showVelocity: true,
                wireframes: false
            }
        })

        Render.run(render)

        // 创建运行器
        const runner = Runner.create()
        Runner.run(runner, engine)

        // 绳子 C：带圆角的矩形组成的链条
        const groupC = Body.nextGroup(true)
        const ropeC = Composites.stack(600, 50, 13, 1, 10, 10, (x, y) => {
            return Bodies.rectangle(x - 20, y, 50, 20, {
                collisionFilter: { group: groupC },
                chamfer: 5 // 圆角效果
            })
        })
        Composites.chain(ropeC, 0.3, 0, -0.3, 0, { stiffness: 1, length: 0 })
        Composite.add(
            ropeC,
            Constraint.create({
                bodyB: ropeC.bodies[0],
                pointB: { x: -20, y: 0 },
                pointA: {
                    x: ropeC.bodies[0].position.x,
                    y: ropeC.bodies[0].position.y
                },
                stiffness: 0.5
            })
        )
        Composite.add(world, ropeC)

        // 加载背景图片
        const backgroundImg = new Image()
        backgroundImg.src = '/lian.webp' // 替换为实际图片路径

        // 自定义绘制逻辑
        Events.on(render, 'afterRender', () => {
            const ctx = render.canvas.getContext('2d')

            // 遍历 ropeC 的每个矩形
            ropeC.bodies.forEach((body) => {
                const { x, y } = body.position
                const width = body.bounds.max.x - body.bounds.min.x
                const height = body.bounds.max.y - body.bounds.min.y

                // 绘制背景图片
                ctx.save()
                ctx.translate(x, y) // 移动到物体中心
                // ctx.rotate(body.angle) // 根据物体角度旋转
                if (backgroundImg.complete) {
                    // 确保图片已加载完成
                    ctx.drawImage(
                        backgroundImg,
                        -width / 2, // 图片左上角相对于物体中心的偏移
                        -height / 2,
                        width, // 图片宽度
                        height // 图片高度
                    )
                }
                ctx.restore()
            })
        })

        // 添加鼠标控制
        const mouse = Mouse.create(render.canvas)
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        })
        Composite.add(world, mouseConstraint)
        render.mouse = mouse

        // 清理函数
        return () => {
            Render.stop(render)
            Runner.stop(runner)
            engine.world = null
        }
    }, [])

    return (
        <div>
            <h1>Next.js 中的绳子模拟</h1>
            <div ref={canvasRef}></div>
        </div>
    )
}
