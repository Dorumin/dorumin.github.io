<script lang="ts">
    type IconType = 'solid' | 'regular' | 'light' | 'thin';
    type IconName = string;

    type IconProps = {
        type: IconType;
        name: IconName;
    };

    const { type, name }: IconProps = $props();
</script>

<i class="fa-{type} fa-{name}"></i>
