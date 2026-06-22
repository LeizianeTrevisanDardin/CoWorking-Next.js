import { Property } from "@/app/types/properties"

type PropertyCardProps = {
    property: Property;
};

export default function PropertyCard({property} : PropertyCardProps) {
    return(
        <div className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ">
            <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-t-xl overflow-hidden">
            {property.image_url ? (
                <img
                    src={property.image_url}
                    alt={property.name}
                    className="w-full h-full object-cover"/>
                    ) : (
                        <div className="text-gray-300 text-4xl">🖼️</div>
                    )}
                    </div>

                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {property.description}
                        </p>

                    </div>
        </div>
    );
}