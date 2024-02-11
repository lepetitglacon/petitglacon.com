import * as THREE from "three";
import * as CANNON from "cannon-es";
import Bus from "~/game/Bus.js";

import heightmap from "assets/heightmap.png";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine

        this.points = 0
        this.bus = new Bus({engine: this.engine})

        const groundMaterial = new CANNON.Material('groundMaterial')
        groundMaterial.friction = 0.25
        groundMaterial.restitution = 0.25

        //ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100)
        const groundMesh = new THREE.Mesh(groundGeometry, this.engine.materials.phong)
        groundMesh.rotateX(-Math.PI / 2)
        groundMesh.receiveShadow = true
        this.engine.scene.add(groundMesh)
        const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
        const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        groundBody.addShape(groundShape)
        groundBody.position.set(0, -1, 0)
        this.engine.world.addBody(groundBody)

        const data = []
        for (let i = 0; i < 100; i++) {
            data[i] = []
            for (let j = 0; j < 10; j++) {
                data[i][j] = 0.5 * Math.cos(0.2 * i * j)
            }
        }
        // Create the heightfield shape
        // const heightfieldShape = new CANNON.Heightfield(data, {
        //     elementSize: 1 // Distance between the data points in X and Y directions
        // })
        // const heightfieldBody = new CANNON.Body({ shape: heightfieldShape })
        // heightfieldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2)
        // heightfieldBody.position.y = groundBody.position.y
        // this.engine.world.addBody(heightfieldBody)

        // const hei = new CANNON.Heightfield([[1]], {
        //     elementSize: 1 // Distance between the data points in X and Y directions
        // })
        //
        // const img = document.createElement('img')
        // img.src = heightmap
        // const scale = 10000
        // hei.setHeightsFromImage(img, new THREE.Vector3(scale,scale,500))
        //
        // const heiBody = new CANNON.Body({
        //     shape: hei,
        //     mass: 0,
        //     material: groundMaterial
        // })
        // heiBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2)
        // // const euler = new THREE.Vector3()
        // // heiBody.quaternion.toEuler(euler)
        // // console.log(euler)
        // // heiBody.quaternion.setFromEuler(new THREE.Vector3(euler.x + 180,euler.y,euler.z))
        // heiBody.position.x -= scale/2
        // heiBody.position.z -= scale/2
        // heiBody.position.y += 50
        // this.engine.world.addBody(heiBody)

        for (let i = 0; i < 5; i++) {
            this.shape = new CANNON.Sphere(1)
            this.body = new CANNON.Body({ mass: 1 })
            this.body.addShape(this.shape)
            this.body.position.y += 10 * i
            this.body.position.x += 10
            this.engine.world.addBody(this.body)
        }


        this.bind()
    }

    update() {

        this.bus.update()

        this.points++
        if (this.points >= 50000) {
            this.engine.dispatchEvent(new Event('game:stop'))
        }
    }

    stop() {
        this.engine.removeEventListener('update', this.updateListener)
        window.removeEventListener('keydown', this.keydownListener)
        this.engine.scene.remove(this.bus)
    }

    bind() {
        this.keydownListener = (e) => {
            switch (e.key) {
                case 'z':
                    break;
            }
        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}

class Heightfield extends CANNON.Shape {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     */

    /**
     * Max value of the data points in the data array.
     */

    /**
     * Minimum value of the data points in the data array.
     */

    /**
     * World spacing between the data points in X and Y direction.
     * @todo elementSizeX and Y
     * @default 1
     */

    /**
     * @default true
     */

    /**
     * @param data An array of numbers, or height values, that are spread out along the x axis.
     */
    constructor(data, options) {
        if (options === void 0) {
            options = {};
        }

        options = Utils.defaults(options, {
            maxValue: null,
            minValue: null,
            elementSize: 1
        });
        super({
            type: Shape.types.HEIGHTFIELD
        });
        this.data = data;
        this.maxValue = options.maxValue;
        this.minValue = options.minValue;
        this.elementSize = options.elementSize;

        if (options.minValue === null) {
            this.updateMinValue();
        }

        if (options.maxValue === null) {
            this.updateMaxValue();
        }

        this.cacheEnabled = true;
        this.pillarConvex = new ConvexPolyhedron();
        this.pillarOffset = new Vec3();
        this.updateBoundingSphereRadius(); // "i_j_isUpper" => { convex: ..., offset: ... }
        // for example:
        // _cachedPillars["0_2_1"]

        this._cachedPillars = {};
    }
    /**
     * Call whenever you change the data array.
     */


    update() {
        this._cachedPillars = {};
    }
    /**
     * Update the `minValue` property
     */


    updateMinValue() {
        const data = this.data;
        let minValue = data[0][0];

        for (let i = 0; i !== data.length; i++) {
            for (let j = 0; j !== data[i].length; j++) {
                const v = data[i][j];

                if (v < minValue) {
                    minValue = v;
                }
            }
        }

        this.minValue = minValue;
    }
    /**
     * Update the `maxValue` property
     */


    updateMaxValue() {
        const data = this.data;
        let maxValue = data[0][0];

        for (let i = 0; i !== data.length; i++) {
            for (let j = 0; j !== data[i].length; j++) {
                const v = data[i][j];

                if (v > maxValue) {
                    maxValue = v;
                }
            }
        }

        this.maxValue = maxValue;
    }
    /**
     * Set the height value at an index. Don't forget to update maxValue and minValue after you're done.
     */


    setHeightValueAtIndex(xi, yi, value) {
        const data = this.data;
        data[xi][yi] = value; // Invalidate cache

        this.clearCachedConvexTrianglePillar(xi, yi, false);

        if (xi > 0) {
            this.clearCachedConvexTrianglePillar(xi - 1, yi, true);
            this.clearCachedConvexTrianglePillar(xi - 1, yi, false);
        }

        if (yi > 0) {
            this.clearCachedConvexTrianglePillar(xi, yi - 1, true);
            this.clearCachedConvexTrianglePillar(xi, yi - 1, false);
        }

        if (yi > 0 && xi > 0) {
            this.clearCachedConvexTrianglePillar(xi - 1, yi - 1, true);
        }
    }
    /**
     * Get max/min in a rectangle in the matrix data
     * @param result An array to store the results in.
     * @return The result array, if it was passed in. Minimum will be at position 0 and max at 1.
     */


    getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, result) {
        if (result === void 0) {
            result = [];
        }

        // Get max and min of the data
        const data = this.data; // Set first value

        let max = this.minValue;

        for (let i = iMinX; i <= iMaxX; i++) {
            for (let j = iMinY; j <= iMaxY; j++) {
                const height = data[i][j];

                if (height > max) {
                    max = height;
                }
            }
        }

        result[0] = this.minValue;
        result[1] = max;
    }
    /**
     * Get the index of a local position on the heightfield. The indexes indicate the rectangles, so if your terrain is made of N x N height data points, you will have rectangle indexes ranging from 0 to N-1.
     * @param result Two-element array
     * @param clamp If the position should be clamped to the heightfield edge.
     */


    getIndexOfPosition(x, y, result, clamp) {
        // Get the index of the data points to test against
        const w = this.elementSize;
        const data = this.data;
        let xi = Math.floor(x / w);
        let yi = Math.floor(y / w);
        result[0] = xi;
        result[1] = yi;

        if (clamp) {
            // Clamp index to edges
            if (xi < 0) {
                xi = 0;
            }

            if (yi < 0) {
                yi = 0;
            }

            if (xi >= data.length - 1) {
                xi = data.length - 1;
            }

            if (yi >= data[0].length - 1) {
                yi = data[0].length - 1;
            }
        } // Bail out if we are out of the terrain


        if (xi < 0 || yi < 0 || xi >= data.length - 1 || yi >= data[0].length - 1) {
            return false;
        }

        return true;
    }

    getTriangleAt(x, y, edgeClamp, a, b, c) {
        const idx = getHeightAt_idx;
        this.getIndexOfPosition(x, y, idx, edgeClamp);
        let xi = idx[0];
        let yi = idx[1];
        const data = this.data;

        if (edgeClamp) {
            xi = Math.min(data.length - 2, Math.max(0, xi));
            yi = Math.min(data[0].length - 2, Math.max(0, yi));
        }

        const elementSize = this.elementSize;
        const lowerDist2 = (x / elementSize - xi) ** 2 + (y / elementSize - yi) ** 2;
        const upperDist2 = (x / elementSize - (xi + 1)) ** 2 + (y / elementSize - (yi + 1)) ** 2;
        const upper = lowerDist2 > upperDist2;
        this.getTriangle(xi, yi, upper, a, b, c);
        return upper;
    }

    getNormalAt(x, y, edgeClamp, result) {
        const a = getNormalAt_a;
        const b = getNormalAt_b;
        const c = getNormalAt_c;
        const e0 = getNormalAt_e0;
        const e1 = getNormalAt_e1;
        this.getTriangleAt(x, y, edgeClamp, a, b, c);
        b.vsub(a, e0);
        c.vsub(a, e1);
        e0.cross(e1, result);
        result.normalize();
    }
    /**
     * Get an AABB of a square in the heightfield
     * @param xi
     * @param yi
     * @param result
     */


    getAabbAtIndex(xi, yi, _ref) {
        let {
            lowerBound,
            upperBound
        } = _ref;
        const data = this.data;
        const elementSize = this.elementSize;
        lowerBound.set(xi * elementSize, yi * elementSize, data[xi][yi]);
        upperBound.set((xi + 1) * elementSize, (yi + 1) * elementSize, data[xi + 1][yi + 1]);
    }
    /**
     * Get the height in the heightfield at a given position
     */


    getHeightAt(x, y, edgeClamp) {
        const data = this.data;
        const a = getHeightAt_a;
        const b = getHeightAt_b;
        const c = getHeightAt_c;
        const idx = getHeightAt_idx;
        this.getIndexOfPosition(x, y, idx, edgeClamp);
        let xi = idx[0];
        let yi = idx[1];

        if (edgeClamp) {
            xi = Math.min(data.length - 2, Math.max(0, xi));
            yi = Math.min(data[0].length - 2, Math.max(0, yi));
        }

        const upper = this.getTriangleAt(x, y, edgeClamp, a, b, c);
        barycentricWeights(x, y, a.x, a.y, b.x, b.y, c.x, c.y, getHeightAt_weights);
        const w = getHeightAt_weights;

        if (upper) {
            // Top triangle verts
            return data[xi + 1][yi + 1] * w.x + data[xi][yi + 1] * w.y + data[xi + 1][yi] * w.z;
        } else {
            // Top triangle verts
            return data[xi][yi] * w.x + data[xi + 1][yi] * w.y + data[xi][yi + 1] * w.z;
        }
    }

    getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle) {
        return `${xi}_${yi}_${getUpperTriangle ? 1 : 0}`;
    }

    getCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
        return this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
    }

    setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, convex, offset) {
        this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)] = {
            convex,
            offset
        };
    }

    clearCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
        delete this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
    }
    /**
     * Get a triangle from the heightfield
     */


    getTriangle(xi, yi, upper, a, b, c) {
        const data = this.data;
        const elementSize = this.elementSize;

        if (upper) {
            // Top triangle verts
            a.set((xi + 1) * elementSize, (yi + 1) * elementSize, data[xi + 1][yi + 1]);
            b.set(xi * elementSize, (yi + 1) * elementSize, data[xi][yi + 1]);
            c.set((xi + 1) * elementSize, yi * elementSize, data[xi + 1][yi]);
        } else {
            // Top triangle verts
            a.set(xi * elementSize, yi * elementSize, data[xi][yi]);
            b.set((xi + 1) * elementSize, yi * elementSize, data[xi + 1][yi]);
            c.set(xi * elementSize, (yi + 1) * elementSize, data[xi][yi + 1]);
        }
    }
    /**
     * Get a triangle in the terrain in the form of a triangular convex shape.
     */


    getConvexTrianglePillar(xi, yi, getUpperTriangle) {
        let result = this.pillarConvex;
        let offsetResult = this.pillarOffset;

        if (this.cacheEnabled) {
            const data = this.getCachedConvexTrianglePillar(xi, yi, getUpperTriangle);

            if (data) {
                this.pillarConvex = data.convex;
                this.pillarOffset = data.offset;
                return;
            }

            result = new ConvexPolyhedron();
            offsetResult = new Vec3();
            this.pillarConvex = result;
            this.pillarOffset = offsetResult;
        }

        const data = this.data;
        const elementSize = this.elementSize;
        const faces = result.faces; // Reuse verts if possible

        result.vertices.length = 6;

        for (let i = 0; i < 6; i++) {
            if (!result.vertices[i]) {
                result.vertices[i] = new Vec3();
            }
        } // Reuse faces if possible


        faces.length = 5;

        for (let i = 0; i < 5; i++) {
            if (!faces[i]) {
                faces[i] = [];
            }
        }

        const verts = result.vertices;
        const h = (Math.min(data[xi][yi], data[xi + 1][yi], data[xi][yi + 1], data[xi + 1][yi + 1]) - this.minValue) / 2 + this.minValue;

        if (!getUpperTriangle) {
            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set((xi + 0.25) * elementSize, // sort of center of a triangle
                (yi + 0.25) * elementSize, h // vertical center
            ); // Top triangle verts

            verts[0].set(-0.25 * elementSize, -0.25 * elementSize, data[xi][yi] - h);
            verts[1].set(0.75 * elementSize, -0.25 * elementSize, data[xi + 1][yi] - h);
            verts[2].set(-0.25 * elementSize, 0.75 * elementSize, data[xi][yi + 1] - h); // bottom triangle verts

            verts[3].set(-0.25 * elementSize, -0.25 * elementSize, -Math.abs(h) - 1);
            verts[4].set(0.75 * elementSize, -0.25 * elementSize, -Math.abs(h) - 1);
            verts[5].set(-0.25 * elementSize, 0.75 * elementSize, -Math.abs(h) - 1); // top triangle

            faces[0][0] = 0;
            faces[0][1] = 1;
            faces[0][2] = 2; // bottom triangle

            faces[1][0] = 5;
            faces[1][1] = 4;
            faces[1][2] = 3; // -x facing quad

            faces[2][0] = 0;
            faces[2][1] = 2;
            faces[2][2] = 5;
            faces[2][3] = 3; // -y facing quad

            faces[3][0] = 1;
            faces[3][1] = 0;
            faces[3][2] = 3;
            faces[3][3] = 4; // +xy facing quad

            faces[4][0] = 4;
            faces[4][1] = 5;
            faces[4][2] = 2;
            faces[4][3] = 1;
        } else {
            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set((xi + 0.75) * elementSize, // sort of center of a triangle
                (yi + 0.75) * elementSize, h // vertical center
            ); // Top triangle verts

            verts[0].set(0.25 * elementSize, 0.25 * elementSize, data[xi + 1][yi + 1] - h);
            verts[1].set(-0.75 * elementSize, 0.25 * elementSize, data[xi][yi + 1] - h);
            verts[2].set(0.25 * elementSize, -0.75 * elementSize, data[xi + 1][yi] - h); // bottom triangle verts

            verts[3].set(0.25 * elementSize, 0.25 * elementSize, -Math.abs(h) - 1);
            verts[4].set(-0.75 * elementSize, 0.25 * elementSize, -Math.abs(h) - 1);
            verts[5].set(0.25 * elementSize, -0.75 * elementSize, -Math.abs(h) - 1); // Top triangle

            faces[0][0] = 0;
            faces[0][1] = 1;
            faces[0][2] = 2; // bottom triangle

            faces[1][0] = 5;
            faces[1][1] = 4;
            faces[1][2] = 3; // +x facing quad

            faces[2][0] = 2;
            faces[2][1] = 5;
            faces[2][2] = 3;
            faces[2][3] = 0; // +y facing quad

            faces[3][0] = 3;
            faces[3][1] = 4;
            faces[3][2] = 1;
            faces[3][3] = 0; // -xy facing quad

            faces[4][0] = 1;
            faces[4][1] = 4;
            faces[4][2] = 5;
            faces[4][3] = 2;
        }

        result.computeNormals();
        result.computeEdges();
        result.updateBoundingSphereRadius();
        this.setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, result, offsetResult);
    }

    calculateLocalInertia(mass, target) {
        if (target === void 0) {
            target = new Vec3();
        }

        target.set(0, 0, 0);
        return target;
    }

    volume() {
        return (// The terrain is infinite
            Number.MAX_VALUE
        );
    }

    calculateWorldAABB(pos, quat, min, max) {
        /** @TODO do it properly */
        min.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        max.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    }

    updateBoundingSphereRadius() {
        // Use the bounding box of the min/max values
        const data = this.data;
        const s = this.elementSize;
        this.boundingSphereRadius = new Vec3(data.length * s, data[0].length * s, Math.max(Math.abs(this.maxValue), Math.abs(this.minValue))).length();
    }
    /**
     * Sets the height values from an image. Currently only supported in browser.
     */


    setHeightsFromImage(image, scale) {
        const {
            x,
            z,
            y
        } = scale;
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        const matrix = this.data;
        matrix.length = 0;
        this.elementSize = Math.abs(x) / imageData.width;

        for (let i = 0; i < imageData.height; i++) {
            const row = [];

            for (let j = 0; j < imageData.width; j++) {
                const a = imageData.data[(i * imageData.height + j) * 4];
                const b = imageData.data[(i * imageData.height + j) * 4 + 1];
                const c = imageData.data[(i * imageData.height + j) * 4 + 2];
                const height = (a + b + c) / 4 / 255 * z;

                if (x < 0) {
                    row.push(height);
                } else {
                    row.unshift(height);
                }
            }

            if (y < 0) {
                matrix.unshift(row);
            } else {
                matrix.push(row);
            }
        }

        this.updateMaxValue();
        this.updateMinValue();
        this.update();
    }

}