import Matter from 'matter-js'
import { useEffect, useRef } from 'react'

export default function RopeSimulation() {
    const canvasRef = useRef<HTMLElement>()

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
            MouseConstraint
        } = Matter

        // 创建引擎
        const engine = Engine.create()
        const world = engine.world

        // 创建渲染器
        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: {
                // width: 800,
                // height: 600,
                // showAngleIndicator: true,
                // showCollisions: true,
                // showVelocity: true,
                wireframes: false
            }
        })

        Render.run(render)

        // 创建运行器
        const runner = Runner.create()
        Runner.run(runner, engine)

        // // 添加地面
        // const ground = Bodies.rectangle(400, 600, 1200, 50.5, {
        //     isStatic: true
        // })
        // Composite.add(world, [ground])

        // // 绳子 A：矩形组成的链条
        // const groupA = Body.nextGroup(true)
        // const ropeA = Composites.stack(100, 50, 8, 1, 10, 10, (x, y) => {
        //     return Bodies.rectangle(x, y, 50, 20, {
        //         collisionFilter: { group: groupA }
        //     })
        // })
        // Composites.chain(ropeA, 0.5, 0, -0.5, 0, {
        //     stiffness: 0.8,
        //     length: 2,
        //     render: { type: 'line' }
        // })
        // Composite.add(
        //     ropeA,
        //     Constraint.create({
        //         bodyB: ropeA.bodies[0],
        //         pointB: { x: -25, y: 0 },
        //         pointA: {
        //             x: ropeA.bodies[0].position.x,
        //             y: ropeA.bodies[0].position.y
        //         },
        //         stiffness: 0.5
        //     })
        // )
        // Composite.add(world, ropeA)
        //
        // // 绳子 B：圆形组成的链条
        // const groupB = Body.nextGroup(true)
        // const ropeB = Composites.stack(350, 50, 10, 1, 10, 10, (x, y) => {
        //     return Bodies.circle(x, y, 20, {
        //         collisionFilter: { group: groupB }
        //     })
        // })
        // Composites.chain(ropeB, 0.5, 0, -0.5, 0, {
        //     stiffness: 0.8,
        //     length: 2,
        //     render: { type: 'line' }
        // })
        // Composite.add(
        //     ropeB,
        //     Constraint.create({
        //         bodyB: ropeB.bodies[0],
        //         pointB: { x: -20, y: 0 },
        //         pointA: {
        //             x: ropeB.bodies[0].position.x,
        //             y: ropeB.bodies[0].position.y
        //         },
        //         stiffness: 0.5
        //     })
        // )
        // Composite.add(world, ropeB)

        // 绳子 C：带圆角的矩形组成的链条
        const groupC = Body.nextGroup(true)
        const ropeC = Composites.stack(600, 50, 13, 1, 10, 10, (x: number, y:number) => {
            return Bodies.rectangle(x - 20, y, 50, 20, {
                collisionFilter: { group: groupC },
                // @ts-ignore
                chamfer: 5, // 圆角效果
                render: {
                    fillStyle: '#32b6ff' //, // 设置填充颜色
                    //strokeStyle: '#ff0000', // 设置边框颜色
                    // lineWidth: 2 // 边框宽度
                }
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
            // @ts-ignore
            engine.world = null
        }
    }, [])

    return (
        <div>
            <h1>Next.js 中的绳子模拟</h1>
            {/*@ts-ignore*/}
            <div ref={canvasRef}></div>
        </div>
    )
}
