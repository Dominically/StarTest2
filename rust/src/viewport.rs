pub struct Viewport {
    fov: f32,
    alpha: f32,
    max_bound: f32
}

impl Viewport {//Triginomitory and stuff.
    pub fn fov_alpha(fov: f32, alpha: f32) -> Self{
        let max_bound = 2.0*(fov/2.0).tan()*alpha;
        Viewport {
            fov,
            alpha,
            max_bound
        }
    }

    pub fn fov_maxbound(fov: f32, max_bound: f32) -> Self { 
        let alpha = max_bound/(2.0*(fov/2.0).tan());
        Viewport {
            fov,
            alpha,
            max_bound
        }
    }

    pub fn set_fov_constant_max_bound(&mut self, fov: f32){
        self.fov = fov;
        self.alpha = self.max_bound/(2.0*(fov/2.0).tan());
    }

    pub fn set_fov_constant_alpha(&mut self, fov: f32){
        self.fov = fov;
        self.max_bound = 2.0*(fov/2.0).tan()*self.alpha;
    }

    pub fn get_maxbound(&self) -> f32 {
        self.max_bound
    }

    pub fn get_alpha(&self) -> f32 {
        self.alpha
    }

}