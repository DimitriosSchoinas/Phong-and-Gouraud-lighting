#version 300 es

precision mediump float;

in vec3 v_normal;
in vec3 v_fragPos;

out vec4 color;

const int MAX_LIGHTS = 8;

struct LightInfo {
    vec4 pos;      
    vec3 Ia;       
    vec3 Id;       
    vec3 Is;      
};

struct MaterialInfo {
    vec3 Ka;      
    vec3 Kd;       
    vec3 Ks;       
    float shininess;
};

uniform int u_n_lights;
uniform LightInfo u_light[MAX_LIGHTS];
uniform MaterialInfo u_material;

void main() {
    vec3 finalColor = vec3(0.0);
    vec3 normal = normalize(v_normal);
    vec3 viewDir = normalize(-v_fragPos);

    
    for (int i = 0; i < u_n_lights; i++) {
        
        vec3 lightDir;
        if (u_light[i].pos.w == 0.0) {
           
            lightDir = normalize(u_light[i].pos.xyz);
        } else {
           
            lightDir = normalize(u_light[i].pos.xyz - v_fragPos);
        }

        vec3 ambient = u_light[i].Ia * u_material.Ka;

       
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_light[i].Id * u_material.Kd * diff;

        
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_material.shininess);
        vec3 specular = u_light[i].Is * u_material.Ks * spec;

       
        finalColor += ambient + diffuse + specular;
    }

    color = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
