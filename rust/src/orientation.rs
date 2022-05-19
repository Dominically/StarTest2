use crate::{vector3::{PointVector}, matrix::Matrix3};

pub struct Orientation {
    mat: Matrix3, //Rotation matrix.
}

impl Orientation {
    pub fn new(rpy: PointVector) -> Self {
        Orientation {
            mat: Self::gen_rotation_matrix(&rpy)
        }
    }

    fn gen_rotation_matrix(rpy: &PointVector) -> Matrix3{
        let roll = [rpy.x, rpy.x.sin(), rpy.x.cos()];
        let pitch = [rpy.y, rpy.y.sin(), rpy.y.cos()];
        let yaw = [rpy.z, rpy.z.sin(), rpy.z.cos()];
        
        let yaw_mat = Matrix3{values:[
            yaw[2], 0.0, yaw[1],
            0.0, 1.0, 0.0,
            -yaw[1], 0.0, yaw[2]
        ]};

        let pitch_mat = Matrix3{values:[
            1.0, 0.0, 0.0,
            0.0, pitch[2], -pitch[1],
            0.0, pitch[1], pitch[2]
        ]};


        let roll_mat = Matrix3{values:[
            roll[2], -roll[1], 0.0,
            roll[1], roll[2], 0.0,
            0.0, 0.0, 1.0
        ]};

        return yaw_mat * pitch_mat * roll_mat;
    }

    pub fn rotate(&mut self, rpy: PointVector){
        self.mat = self.mat.clone() * Self::gen_rotation_matrix(&rpy);
    }

    pub fn get_mat(&self) -> &Matrix3 {
        &self.mat
    }
}