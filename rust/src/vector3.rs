use std::{ops::{Add, Mul, Sub, Div, AddAssign, Neg}};

pub type PointVector = Vector3<f32>;
pub type ChunkVector = Vector3<i32>;


pub const CHUNK_SIZE: u32 = 128;
const CHUNK_F32: f32 = CHUNK_SIZE as f32;

#[derive(Clone, Copy, Debug)]
pub struct Vector3<T> {
    pub x: T,
    pub y: T,
    pub z: T
}

impl<T> Vector3<T> {
    pub fn new(x: T, y: T, z: T) -> Self {
        Vector3 {
            x,
            y,
            z
        }
    }
}

impl<T: Copy> Vector3<T> {
    pub fn to_array(&self) -> [T; 3] {
        return [self.x, self.y, self.z];
    }
}

impl<T: Copy + PartialOrd> Vector3<T> {
    pub fn bounds(vecs: &[&Vector3<T>]) -> Result<(Vector3<T>, Vector3<T>), ()>{
        if vecs.len() > 0 {
            let mut lo = *vecs[0];
            let mut hi = *vecs[0];
            for v in &vecs[1..] {
                lo = Vector3::new(
                    if v.x<lo.x {v.x} else {lo.x},
                    if v.y<lo.y {v.y} else {lo.y},
                    if v.z<lo.z {v.z} else {lo.z},
                );

                hi = Vector3::new(
                    if v.x>hi.x {v.x} else {hi.x},
                    if v.y>hi.y {v.y} else {hi.y},
                    if v.z>hi.z {v.z} else {hi.z},
                );
            }
            return Ok((lo, hi));
        } else {
            return Err(());
        }
    }
}

impl<T: Add<Output = T>> Add for Vector3<T>{
    type Output = Vector3<T>;

    fn add(self, rhs: Self) -> Self::Output {
        Vector3 {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z
        }
    }
}

impl <T: AddAssign<T>> AddAssign for Vector3<T> {
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x;
        self.y += rhs.y;
        self.z += rhs.z;
    }
}

impl<T: Sub<Output = T>> Sub for Vector3<T>{
    type Output = Vector3<T>;

    fn sub(self, rhs: Self) -> Self::Output {
        Vector3 {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z
        }
    }
}

impl<T: Mul<Output = T> + Copy> Mul<T> for Vector3<T> {
    type Output = Vector3<T>;

    fn mul(self, rhs: T) -> Self::Output {
        Vector3 {
            x: self.x * rhs,
            y: self.y * rhs,
            z: self.z * rhs
        }
    }
}

impl<T: Mul<Output = T> + Add<Output = T>> Mul<Vector3<T>> for Vector3<T> {
    type Output = T;

    fn mul(self, rhs: Vector3<T>) -> Self::Output {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
    }
} 

impl<T: Div<Output = T> + Copy> Div<T> for Vector3<T> {
    type Output = Vector3<T>;

    fn div(self, rhs: T) -> Self::Output {
        Vector3 {
            x: self.x / rhs,
            y: self.y / rhs,
            z: self.z / rhs
        }
    }
}

impl<T: Neg<Output = T>> Neg for Vector3<T> {
    type Output = Vector3<T>;

    fn neg(self) -> Self::Output {
        Vector3 {
            x: -self.x,
            y: -self.y,
            z: -self.z
        }
    }
}

impl PointVector {
    pub fn zeros() -> PointVector {
        PointVector::new(0.0, 0.0, 0.0)
    }
}


impl ChunkVector {
    pub fn from_point(v: PointVector) -> ChunkVector{
        ChunkVector {
            x: (v.x/CHUNK_F32).floor() as i32,
            y: (v.y/CHUNK_F32).floor() as i32,
            z: (v.z/CHUNK_F32).floor() as i32
        }
    }
}

impl PartialEq for ChunkVector {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y && self.z == other.z
    }
}
