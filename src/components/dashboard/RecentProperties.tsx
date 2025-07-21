import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/hooks/useSupabaseQuery";

export function RecentProperties() {
  const { data: properties = [], isLoading } = useProperties();
  const recentProperties = properties.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProperties.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No properties yet</p>
          ) : (
            recentProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{property.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {property.address}, {property.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">₹{property.price?.toLocaleString()}</p>
                  <Badge variant={property.status === "available" ? "default" : "secondary"}>
                    {property.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}