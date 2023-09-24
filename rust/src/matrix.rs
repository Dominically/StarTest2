use crate::vector3::PointVector;
use std::ops::Mul;

#[derive(Clone, Debug)]
pub struct Matrix3 {
    pub values: [f32; 9]
}


impl Matrix3 {
    pub fn from_vectors_vert(vectors: [PointVector; 3]) -> Self {
        let mut values = [0.0 ; 9];

        for (i, vector) in vectors.iter().enumerate() {
            for (j, item) in vector.to_array().iter().enumerate() {
                values[j*3+i] = *item;
            }
        }

        Matrix3 { values }
    }

    pub fn to_vectors_vert(&self) -> [PointVector; 3] {
        let v = &self.values;
        return [
            PointVector::new(v[0],v[3],v[6]),
            PointVector::new(v[1],v[4],v[7]),
            PointVector::new(v[2],v[5],v[8])
        ]
    }

    pub fn det(&self) -> f32 {
        let v = &self.values;

        v[0]*(v[4]*v[8]-v[5]*v[7]) +
        v[1]*(v[5]*v[6]-v[3]*v[8]) +
        v[2]*(v[3]*v[7]-v[4]*v[6])

        //0 1 2
        //3 4 5
        //6 7 8
    }

    pub fn invert(&self) -> Option<Matrix3> {
        let v = &self.values;
        let det = self.det();
        if det == 0.0 {
            return None;
        }

        Some(Matrix3 {
            values: [  //hardcoded values.
                v[4]*v[8]-v[5]*v[7],
                v[2]*v[7]-v[1]*v[8],
                v[1]*v[5]-v[2]*v[4],
                v[5]*v[6]-v[3]*v[8],
                v[0]*v[8]-v[2]*v[6],
                v[2]*v[3]-v[0]*v[5],
                v[3]*v[7]-v[4]*v[6],
                v[1]*v[6]-v[0]*v[7],
                v[0]*v[4]-v[1]*v[3]
            ].map(|x| x/det)
        })
    }

    pub fn solve_vec(&self, vec: PointVector) -> PointVector{
        let v = &self.values;
        PointVector::new(
            vec.x*v[0] + vec.y*v[1] + vec.z*v[2],
            vec.x*v[3] + vec.y*v[4] + vec.z*v[5],
            vec.x*v[6] + vec.y*v[7] + vec.z*v[8]
        )
    }
}

impl Mul<Matrix3> for Matrix3 {
    type Output = Matrix3;

    fn mul(self, rhs: Matrix3) -> Self::Output {
        let mut new_values = [0.0; 9];
        for row in 0..3 {
            for col in 0..3 {
                let mut total = 0.0;
                for offset in 0..3 {
                    total += self.values[row*3+offset]*rhs.values[col+offset*3]
                }
                new_values[row*3+col] = total;
            }
        }

        Matrix3 {
            values: new_values
        }
    }
}