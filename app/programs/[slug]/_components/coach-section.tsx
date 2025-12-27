import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface CoachSectionProps {
  coach: {
    id: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bioShort: string | null;
    bioLong: string | null;
    coachingExperience: string | null;
    certifications: string | null;
    snsUrl: string | null;
  };
}

export function CoachSection({ coach }: CoachSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>코치 소개</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 코치 프로필 */}
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarImage src={coach.avatarUrl || undefined} />
            <AvatarFallback className="text-xl">
              {(coach.displayName || coach.name || "C")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-bold">
              {coach.displayName || coach.name || "코치"}
            </h3>
            {coach.bioShort && (
              <p className="text-sm text-muted-foreground">{coach.bioShort}</p>
            )}
          </div>
        </div>

        {/* 경력 */}
        {coach.coachingExperience && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              📋 경력
            </h4>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {coach.coachingExperience}
            </p>
          </div>
        )}

        {/* 자격증 */}
        {coach.certifications && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              🏆 자격증
            </h4>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {coach.certifications}
            </p>
          </div>
        )}

        {/* SNS 링크 */}
        {coach.snsUrl && (
          <Button variant="outline" className="w-full" asChild>
            <Link href={coach.snsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              코치 프로필 방문하기
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

