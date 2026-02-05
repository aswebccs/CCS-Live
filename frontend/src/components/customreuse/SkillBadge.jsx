import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

// Reusable Skill Badge Component for profile pages
export const SkillBadge = ({ skill, onDelete, isDeleting }) => {
    return (
        <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-2">
            {skill}
            {onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <X className="h-3 w-3" />
                    )}
                </Button>
            )}
        </Badge>
    );
};
