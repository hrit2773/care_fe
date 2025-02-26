import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Link, navigate } from "raviger";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Loading from "@/components/Common/Loading";
import PageTitle from "@/components/Common/PageTitle";

import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import { ContactPoint } from "@/types/common/contactPoint";
import deviceApi from "@/types/device/deviceApi";

import AssociateLocationSheet from "./components/AssociateLocationSheet";

interface Props {
  facilityId: string;
  deviceId: string;
}

export default function DeviceDetail({ facilityId, deviceId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const { data: device, isLoading } = useQuery({
    queryKey: ["device", facilityId, deviceId],
    queryFn: query(deviceApi.retrieve, {
      pathParams: { facility_id: facilityId, id: deviceId },
    }),
  });

  const { mutate: deleteDevice, isPending: isDeleting } = useMutation({
    mutationFn: mutate(deviceApi.delete, {
      pathParams: { facility_id: facilityId, id: deviceId },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      navigate(`/facility/${facilityId}/settings/devices`);
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!device) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      case "entered_in_error":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const getAvailabilityStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "lost":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "damaged":
      case "destroyed":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const renderContactInfo = (contact: ContactPoint) => {
    const getContactLink = (system: string, value: string) => {
      switch (system) {
        case "phone":
        case "fax":
          return `tel:${value}`;
        case "email":
          return `mailto:${value}`;
        case "url":
          return value;
        case "sms":
          return `sms:${value}`;
        default:
          return null;
      }
    };

    const link = getContactLink(contact.system, contact.value);

    return (
      <div key={`${contact.system}-${contact.value}`} className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{t(contact.system)}</p>
        {link ? (
          <a
            href={link}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            target={contact.system === "url" ? "_blank" : undefined}
            rel={contact.system === "url" ? "noopener noreferrer" : undefined}
          >
            {contact.value}
          </a>
        ) : (
          <p className="text-sm text-gray-900">{contact.value}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <PageTitle title={device.registered_name} />
        <div className="flex items-center gap-2">
          <Link href={`/devices/${deviceId}/edit`}>
            <Button variant="outline">{t("edit")}</Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t("delete")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("delete_device")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("delete_device_confirmation")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteDevice()}
                  className={cn(buttonVariants({ variant: "destructive" }))}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleting") : t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("device_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {t("registered_name")}
                </h4>
                <p className="mt-1">{device.registered_name}</p>
              </div>
              {device.user_friendly_name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {t("user_friendly_name")}
                  </h4>
                  <p className="mt-1">{device.user_friendly_name}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {t("location")}
                </h4>
                <div className="mt-1 flex items-center gap-6">
                  {device.current_location ? (
                    <>
                      <Link
                        href={`/location/${device.current_location.id}`}
                        className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                      >
                        {device.current_location.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </>
                  ) : (
                    <span className="text-gray-500">{t("no_location")}</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationSheetOpen(true)}
                  >
                    {device.current_location ? t("change") : t("add")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={getStatusColor(device.status)}
                >
                  {t(`device_status_${device.status}`)}
                </Badge>
                <Badge
                  variant="secondary"
                  className={getAvailabilityStatusColor(
                    device.availability_status,
                  )}
                >
                  {t(
                    `device_availability_status_${device.availability_status}`,
                  )}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(device.identifier || device.lot_number) && (
                  <>
                    {device.identifier && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("identifier")}
                        </h4>
                        <p className="mt-1">{device.identifier}</p>
                      </div>
                    )}
                    {device.lot_number && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("lot_number")}
                        </h4>
                        <p className="mt-1">{device.lot_number}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(device.manufacturer || device.model_number) && (
                  <>
                    {device.manufacturer && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("manufacturer")}
                        </h4>
                        <p className="mt-1">{device.manufacturer}</p>
                      </div>
                    )}
                    {device.model_number && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("model_number")}
                        </h4>
                        <p className="mt-1">{device.model_number}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(device.serial_number || device.part_number) && (
                  <>
                    {device.serial_number && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("serial_number")}
                        </h4>
                        <p className="mt-1">{device.serial_number}</p>
                      </div>
                    )}
                    {device.part_number && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("part_number")}
                        </h4>
                        <p className="mt-1">{device.part_number}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(device.manufacture_date || device.expiration_date) && (
                  <>
                    {device.manufacture_date && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("manufacture_date")}
                        </h4>
                        <p className="mt-1">
                          {formatDate(device.manufacture_date, "dd/MM/yyyy")}
                        </p>
                      </div>
                    )}
                    {device.expiration_date && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("expiration_date")}
                        </h4>
                        <p className="mt-1">
                          {formatDate(device.expiration_date, "dd/MM/yyyy")}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {device.contact?.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("contact_information")}</CardTitle>
              <CardDescription>
                {t("device_contact_description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {device.contact.map(renderContactInfo)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AssociateLocationSheet
        open={isLocationSheetOpen}
        onOpenChange={setIsLocationSheetOpen}
        facilityId={facilityId}
        deviceId={deviceId}
      />
    </div>
  );
}
