use std::f32::consts::PI;

use crate::{vector3::{PointVector}, orientation::Orientation, viewport::Viewport, matrix::Matrix3};

pub struct Camera {
    pub pos: PointVector,
    pub vel: PointVector,
    pub ori: Orientation,
    pub rpy_vel: PointVector,
    pub target_rpy_vel: PointVector,
    pub rvp: Viewport, //Render Viewport for drawing stars.
    pub cvp: Viewport, //Chunk Viewport for loading chunks.
    pub thrust: f32,
}

pub struct Projector<'a> {
    cam: &'a Camera,
    xcol: PointVector,
    ycol: PointVector,
    total: PointVector,
}

const RPY_FACTOR: f32 = 20.0;
const MAX_ANGLE: f32 = PI/1.3;
const MASS: f32 = 100.0; //20kg. Assuming one unit is a meter.
const RESISTANCE_FACTOR: f32 = 1.0;


impl Camera {
    pub fn new(max_bound: f32, fov: f32, render_distance: f32) -> Self {
        Camera { 
            pos: PointVector::zeros(),
            vel: PointVector::new(0.0, 0.0, 0.0), 
            ori: Orientation::new(
                PointVector::new(0.0, 0.0, 0.0)

            ),
            rpy_vel: PointVector::zeros(),
            target_rpy_vel: PointVector::zeros(),
            rvp: Viewport::fov_maxbound(fov, max_bound),
            cvp: Viewport::fov_alpha(fov, render_distance),
            thrust: 0.0
        }
    }

    pub fn tick(&mut self, delta: f32) {
        self.pos += self.vel*delta;
        self.ori.rotate(self.rpy_vel * delta);

        let delta_vel = self.target_rpy_vel - self.rpy_vel;
        self.rpy_vel += delta_vel*(delta/RPY_FACTOR);
        
        let resistance = -self.vel*RESISTANCE_FACTOR;

        self.vel += (self.ori.get_mat().to_vectors_vert()[2]*(self.thrust) + resistance)*delta/MASS;

        //self.vel = self.ori.get_mat().to_vectors_vert()[2] * self.speed;

        //let fov = MAX_ANGLE*(self.speed-3.0)/(self.speed+0.1);
        //self.rvp.set_fov_constant_max_bound(fov);
        //self.rvp.set_fov_constant_alpha(fov);
    }
}

impl<'a> Projector<'a> {
    pub fn new(camera: &'a Camera, vp: &Viewport) -> Self{
        let camera_dirs = camera.ori.get_mat().to_vectors_vert();
        let alpha = vp.get_alpha();

        Projector {
            cam: camera,
            xcol: camera_dirs[0] * -1.0,
            ycol: camera_dirs[1] * 1.0, //Y coords inverted because PIXI's Y is down and mine is up.
            total: camera_dirs[2] * alpha
        }
    }

    pub fn project_point(&self, point: &PointVector) -> Option<PointVector> {
        let lambda = *point - self.cam.pos;
        let unsolved_inv = Matrix3::from_vectors_vert([lambda, self.xcol, self.ycol]).invert();
        match unsolved_inv {
            Some(m) => {
                return Some(m.solve_vec(self.total));  
            },
            None => {
                return None;
            },
        }
    }
}