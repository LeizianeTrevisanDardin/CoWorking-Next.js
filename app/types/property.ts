export type Property ={
    id: string,
    owner_id: string,
    name: string,
    description: string | null,
    address: string | null,
    neighborhood: string | null,
    square_feet: number | null,
    parking: boolean,
    public_transportation: boolean,
    image_url: string | null,
    created_at: string
};