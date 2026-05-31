import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import SetRow from '../../src/components/workout/SetRow';

const meta = {
  title: 'Workout/SetRow',
  component: SetRow,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#000000', padding: 16, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    index: 0,
    data: { weight: 80, reps: 8, status: 'pending' as const },
    onWeightChange: fn(),
    onRepsChange: fn(),
    onToggle: fn(),
    weightStep: 2.5,
  },
  argTypes: {
    data: { control: 'object' },
  },
} satisfies Meta<typeof SetRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = { args: { data: { weight: 80, reps: 8, status: 'pending' } } };
export const Active: Story = { args: { data: { weight: 80, reps: 8, status: 'active' } } };
export const Done: Story = { args: { data: { weight: 85, reps: 7, status: 'done' } } };
export const Step2_5: Story = {
  args: { data: { weight: 52.5, reps: 12, status: 'pending' }, weightStep: 2.5 },
  name: 'Weight step 2.5kg',
};
