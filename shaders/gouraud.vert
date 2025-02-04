#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_model_view;
uniform mat4 u_normals;

out vec3 v_color;

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
    gl_Position = u_projection * u_model_view * a_position;
    vec3 normal = normalize((u_normals * vec4(a_normal, 0.0f)).xyz);
    vec3 fragPos = (u_model_view * a_position).xyz;
    vec3 viewDir = normalize(-fragPos);
    vec3 finalColor = vec3(0.0f);


    for(int i = 0; i < u_n_lights; i++) {
        vec3 lightDir;
        if(u_light[i].pos.w == 0.0f) {
            lightDir = normalize(u_light[i].pos.xyz); 
        } else {
            lightDir = normalize(u_light[i].pos.xyz - fragPos);
        }

        float diff = max(dot(normal, lightDir), 0.0f);
        vec3 diffuse = u_light[i].Id * u_material.Kd * diff;

        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0f), u_material.shininess);
        vec3 specular = u_light[i].Is * u_material.Ks * spec;

        finalColor += u_light[i].Ia * u_material.Ka + diffuse + specular;
    }

    v_color = clamp(finalColor, 0.0f, 1.0f);
}
